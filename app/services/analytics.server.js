import prisma from "../db.server";
import { computeRfmAnalytics } from "./rfm.server";

const GET_CUSTOMERS_QUERY = `#graphql
  query getStoreCustomers($first: Int!, $after: String) {
    shop {
      currencyCode
    }
    customers(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        firstName
        lastName
        email
        numberOfOrders
        amountSpent {
          amount
          currencyCode
        }
        createdAt
        updatedAt
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          nodes {
            id
            processedAt
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches customers and shop currency from Shopify GraphQL Admin API across pages.
 * 
 * @param {Object} admin Shopify Admin GraphQL client
 * @returns {Object} { rawCustomers, currencyCode }
 */
export async function fetchShopifyCustomers(admin) {
  let allCustomers = [];
  let hasNextPage = true;
  let cursor = null;
  let maxPages = 4;
  let currencyCode = "USD";

  while (hasNextPage && maxPages > 0) {
    maxPages--;
    const response = await admin.graphql(GET_CUSTOMERS_QUERY, {
      variables: {
        first: 250,
        after: cursor
      }
    });

    const json = await response.json();
    if (json?.data?.shop?.currencyCode) {
      currencyCode = json.data.shop.currencyCode;
    }

    const data = json?.data?.customers;
    if (!data || !data.nodes) {
      break;
    }

    allCustomers.push(...data.nodes);
    hasNextPage = data.pageInfo?.hasNextPage;
    cursor = data.pageInfo?.endCursor;
  }

  return { rawCustomers: allCustomers, currencyCode };
}

/**
 * Gets cached snapshot or fetches fresh customer metrics from Shopify Admin API.
 * 
 * @param {Object} admin Shopify Admin API context
 * @param {string} shop Current shop identifier (myshopify domain)
 * @param {boolean} forceRefresh If true, skips cache and re-fetches from Shopify
 * @returns {Object} Analytical metrics and RFM calculation result
 */
export async function getOrFetchAnalytics(admin, shop, forceRefresh = false) {
  if (!forceRefresh) {
    // Check for cached snapshot from today in PostgreSQL database
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingSnapshot = await prisma.customerSegmentSnapshot.findFirst({
      where: {
        shop,
        createdAt: {
          gte: startOfDay
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (existingSnapshot && existingSnapshot.segmentData && (existingSnapshot.avgOrdersPerCustomer < 100)) {
      const storedCurrency = existingSnapshot.segmentData.currencyCode || "USD";
      return {
        kpis: {
          totalCustomers: existingSnapshot.totalCustomers,
          firstTimeCustomers: existingSnapshot.firstTimeCustomers,
          returningCustomers: existingSnapshot.returningCustomers,
          firstTimePercent: existingSnapshot.totalCustomers > 0
            ? Math.round((existingSnapshot.firstTimeCustomers / existingSnapshot.totalCustomers) * 100)
            : 0,
          returningPercent: existingSnapshot.totalCustomers > 0
            ? Math.round((existingSnapshot.returningCustomers / existingSnapshot.totalCustomers) * 100)
            : 0,
          totalCustomerValue: existingSnapshot.totalCustomerValue,
          firstTimeValue: existingSnapshot.firstTimeValue,
          returningValue: existingSnapshot.returningValue,
          avgOrdersPerCustomer: existingSnapshot.avgOrdersPerCustomer,
          firstTimeAvgOrders: existingSnapshot.firstTimeAvgOrders,
          returningAvgOrders: existingSnapshot.returningAvgOrders,
          daysBetweenOrders: existingSnapshot.daysBetweenOrders,
          avgOrderValue: existingSnapshot.avgOrderValue,
          firstTimeAov: existingSnapshot.firstTimeAov,
          returningAov: existingSnapshot.returningAov,
          currencyCode: storedCurrency
        },
        scatterPoints: existingSnapshot.segmentData.scatterPoints || [],
        segmentSummaries: existingSnapshot.segmentData.segmentSummaries || [],
        totalCustomerCount: existingSnapshot.totalCustomers,
        currencyCode: storedCurrency,
        cachedAt: existingSnapshot.createdAt
      };
    }
  }

  // Fetch fresh data from Shopify Admin API
  const { rawCustomers, currencyCode } = await fetchShopifyCustomers(admin);
  const analyticsResult = computeRfmAnalytics(rawCustomers, currencyCode);

  // Cache snapshot in PostgreSQL via Prisma
  try {
    await prisma.customerSegmentSnapshot.create({
      data: {
        shop,
        totalCustomers: analyticsResult.kpis.totalCustomers,
        firstTimeCustomers: analyticsResult.kpis.firstTimeCustomers,
        returningCustomers: analyticsResult.kpis.returningCustomers,
        totalCustomerValue: analyticsResult.kpis.totalCustomerValue,
        firstTimeValue: analyticsResult.kpis.firstTimeValue,
        returningValue: analyticsResult.kpis.returningValue,
        avgOrdersPerCustomer: analyticsResult.kpis.avgOrdersPerCustomer,
        firstTimeAvgOrders: analyticsResult.kpis.firstTimeAvgOrders,
        returningAvgOrders: analyticsResult.kpis.returningAvgOrders,
        daysBetweenOrders: analyticsResult.kpis.daysBetweenOrders,
        avgOrderValue: analyticsResult.kpis.avgOrderValue,
        firstTimeAov: analyticsResult.kpis.firstTimeAov,
        returningAov: analyticsResult.kpis.returningAov,
        segmentData: {
          scatterPoints: analyticsResult.scatterPoints,
          segmentSummaries: analyticsResult.segmentSummaries,
          currencyCode
        }
      }
    });
  } catch (err) {
    console.error("Failed to save segment snapshot cache:", err);
  }

  return {
    ...analyticsResult,
    currencyCode,
    cachedAt: new Date()
  };
}

/**
 * Retrieves app settings for a given shop, or creates defaults if none exists.
 * 
 * @param {string} shop Shopify shop domain
 * @returns {Object} AppSettings record
 */
export async function getAppSettings(shop) {
  let settings = await prisma.appSettings.findUnique({
    where: { shop }
  });

  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        shop,
        autoRefresh: true,
        autoTagging: false,
        emailReporting: false,
        reportEmails: "",
        addSegmentsToCustomersPage: true
      }
    });
  }

  return settings;
}

/**
 * Updates app settings for a given shop.
 * 
 * @param {string} shop Shopify shop domain
 * @param {Object} data Settings payload
 * @returns {Object} Updated AppSettings record
 */
export async function updateAppSettings(shop, data) {
  return await prisma.appSettings.upsert({
    where: { shop },
    update: data,
    create: {
      shop,
      ...data
    }
  });
}
