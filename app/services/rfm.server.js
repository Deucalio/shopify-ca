/**
 * RFM Segmentation and Metrics Calculation Engine for "Customer Analytics: VIP & LTV"
 */

export const SEGMENT_DEFINITIONS = {
  NEW: {
    key: "new",
    name: "New",
    subtitle: "Made first order recently",
    color: "#008060",
    tip: "Welcome new customers with onboarding emails and a special first-repeat discount.",
    action: "Send Welcome Discount"
  },
  ABOUT_TO_SLEEP: {
    key: "about_to_sleep",
    name: "About to Sleep",
    subtitle: "Made first order some time ago",
    color: "#E0B252",
    tip: "Re-engage before they forget your brand. Offer personalized product recommendations.",
    action: "Re-engage Customer"
  },
  SLEEPERS: {
    key: "sleepers",
    name: "Sleepers",
    subtitle: "Made first order long time ago",
    color: "#6D7175",
    tip: "Win-back campaign with win-back incentives or survey why they stopped purchasing.",
    action: "Launch Win-back"
  },
  POTENTIAL_LOYAL: {
    key: "potential_loyal",
    name: "Potential Loyal",
    subtitle: "Made more orders recently",
    color: "#2C6ECB",
    tip: "Nurture with loyalty programs, cross-sells, or VIP perks to convert them to Loyal.",
    action: "Invite to Loyalty"
  },
  LOYAL: {
    key: "loyal",
    name: "Loyal",
    subtitle: "Making orders often and regularly",
    color: "#5C6AC4",
    tip: "Reward loyalty with exclusive early access, free gifts, and premium support.",
    action: "Send VIP Reward"
  },
  LOYAL_AT_RISK: {
    key: "loyal_at_risk",
    name: "Loyal at Risk",
    subtitle: "Previously Loyal not ordered recently",
    color: "#D9381E",
    tip: "High priority win-back! Reach out personally or offer a high-value re-engagement offer.",
    action: "Personal Win-back"
  }
};

/**
 * Classifies a single customer into one of 6 RFM segments.
 * 
 * @param {Object} customer Processed customer metrics
 * @returns {Object} Segment definition object
 */
export function classifyCustomerSegment(customer) {
  const ordersCount = typeof customer.numberOfOrders === "number" ? customer.numberOfOrders : parseInt(customer.numberOfOrders || 0, 10) || 0;
  const daysSinceLastOrder = customer.daysSinceLastOrder ?? 999;

  if (ordersCount >= 3) {
    if (daysSinceLastOrder <= 60) {
      return SEGMENT_DEFINITIONS.LOYAL;
    } else {
      return SEGMENT_DEFINITIONS.LOYAL_AT_RISK;
    }
  } else if (ordersCount === 2) {
    if (daysSinceLastOrder <= 45) {
      return SEGMENT_DEFINITIONS.POTENTIAL_LOYAL;
    } else if (daysSinceLastOrder <= 90) {
      return SEGMENT_DEFINITIONS.ABOUT_TO_SLEEP;
    } else {
      return SEGMENT_DEFINITIONS.SLEEPERS;
    }
  } else if (ordersCount === 1) {
    if (daysSinceLastOrder <= 30) {
      return SEGMENT_DEFINITIONS.NEW;
    } else if (daysSinceLastOrder <= 90) {
      return SEGMENT_DEFINITIONS.ABOUT_TO_SLEEP;
    } else {
      return SEGMENT_DEFINITIONS.SLEEPERS;
    }
  } else {
    // 0 orders
    return SEGMENT_DEFINITIONS.NEW;
  }
}

/**
 * Computes aggregate metrics, KPI stats, scatter plot points, and segment summaries.
 * 
 * @param {Array} rawCustomers Array of raw customer nodes from Shopify GraphQL
 * @returns {Object} Complete analytics calculation bundle
 */
export function computeRfmAnalytics(rawCustomers = []) {
  const now = new Date();

  const processedCustomers = rawCustomers.map((node) => {
    const ordersCount = parseInt(node.numberOfOrders || (node.orders?.nodes?.length || 0), 10) || 0;
    const totalSpent = parseFloat(node.amountSpent?.amount || "0") || 0;
    const currencyCode = node.amountSpent?.currencyCode || "USD";

    // Extract order dates if present
    const orderDates = (node.orders?.nodes || [])
      .map((o) => new Date(o.processedAt || o.createdAt))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => b - a); // descending order (newest first)

    let daysSinceLastOrder = 999;
    if (orderDates.length > 0) {
      const lastOrderDate = orderDates[0];
      const diffTime = Math.abs(now - lastOrderDate);
      daysSinceLastOrder = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else if (node.updatedAt) {
      const updatedDate = new Date(node.updatedAt);
      const diffTime = Math.abs(now - updatedDate);
      daysSinceLastOrder = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Days between orders calculation for returning customers
    let customerDaysBetweenOrders = 0;
    if (orderDates.length > 1) {
      const newest = orderDates[0];
      const oldest = orderDates[orderDates.length - 1];
      const totalSpanDays = Math.floor((newest - oldest) / (1000 * 60 * 60 * 24));
      customerDaysBetweenOrders = Math.round(totalSpanDays / (orderDates.length - 1));
    }

    const customerObj = {
      id: node.id,
      name: `${node.firstName || ""} ${node.lastName || ""}`.trim() || node.email || "Guest Customer",
      email: node.email || "",
      numberOfOrders: ordersCount,
      totalSpent,
      currencyCode,
      daysSinceLastOrder,
      daysBetweenOrders: customerDaysBetweenOrders
    };

    const segmentDef = classifyCustomerSegment(customerObj);
    customerObj.segmentKey = segmentDef.key;
    customerObj.segmentName = segmentDef.name;
    customerObj.segmentColor = segmentDef.color;

    return customerObj;
  });

  const totalCustomers = processedCustomers.length;
  const firstTimeCustomersList = processedCustomers.filter((c) => c.numberOfOrders === 1);
  const returningCustomersList = processedCustomers.filter((c) => c.numberOfOrders > 1);

  const firstTimeCustomers = firstTimeCustomersList.length;
  const returningCustomers = returningCustomersList.length;

  const totalCustomerValue = processedCustomers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
  const firstTimeValue = firstTimeCustomersList.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
  const returningValue = returningCustomersList.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);

  const totalOrdersSum = processedCustomers.reduce((sum, c) => sum + Number(c.numberOfOrders || 0), 0);
  const firstTimeOrdersSum = firstTimeCustomersList.reduce((sum, c) => sum + Number(c.numberOfOrders || 0), 0);
  const returningOrdersSum = returningCustomersList.reduce((sum, c) => sum + Number(c.numberOfOrders || 0), 0);

  const avgOrdersPerCustomer = totalCustomers > 0 ? parseFloat((totalOrdersSum / totalCustomers).toFixed(1)) : 0;
  const firstTimeAvgOrders = firstTimeCustomers > 0 ? parseFloat((firstTimeOrdersSum / firstTimeCustomers).toFixed(1)) : 1;
  const returningAvgOrders = returningCustomers > 0 ? parseFloat((returningOrdersSum / returningCustomers).toFixed(1)) : 0;

  // Days between orders across returning customers
  const returningWithSpan = returningCustomersList.filter((c) => c.daysBetweenOrders > 0);
  const daysBetweenOrders = returningWithSpan.length > 0
    ? Math.round(returningWithSpan.reduce((sum, c) => sum + Number(c.daysBetweenOrders || 0), 0) / returningWithSpan.length)
    : 0;

  const avgOrderValue = totalOrdersSum > 0 ? parseFloat((totalCustomerValue / totalOrdersSum).toFixed(2)) : 0;
  const firstTimeAov = firstTimeOrdersSum > 0 ? parseFloat((firstTimeValue / firstTimeOrdersSum).toFixed(2)) : 0;
  const returningAov = returningOrdersSum > 0 ? parseFloat((returningValue / returningOrdersSum).toFixed(2)) : 0;

  // Scatter plot points (X: Days since last order, Y: Number of orders)
  const scatterPoints = processedCustomers.map((c) => ({
    id: c.id,
    customerName: c.name,
    x: Number(c.daysSinceLastOrder || 0),
    y: Number(c.numberOfOrders || 0),
    segmentKey: c.segmentKey,
    segmentName: c.segmentName,
    color: c.segmentColor,
    totalSpent: Number(c.totalSpent || 0)
  }));

  // Segment Table Summaries for all 6 segments
  const segmentSummaries = Object.values(SEGMENT_DEFINITIONS).map((def) => {
    const list = processedCustomers.filter((c) => c.segmentKey === def.key);
    const count = list.length;
    const custValue = list.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
    const segOrders = list.reduce((sum, c) => sum + Number(c.numberOfOrders || 0), 0);
    const segAvgOrders = count > 0 ? parseFloat((segOrders / count).toFixed(1)) : 0;

    const segReturningWithSpan = list.filter((c) => c.daysBetweenOrders > 0);
    const segDaysBetween = segReturningWithSpan.length > 0
      ? Math.round(segReturningWithSpan.reduce((sum, c) => sum + Number(c.daysBetweenOrders || 0), 0) / segReturningWithSpan.length)
      : 0;

    const segAov = segOrders > 0 ? parseFloat((custValue / segOrders).toFixed(2)) : 0;

    return {
      segmentKey: def.key,
      name: def.name,
      subtitle: def.subtitle,
      color: def.color,
      tip: def.tip,
      action: def.action,
      customerCount: count,
      customerValue: parseFloat(custValue.toFixed(2)),
      avgOrders: segAvgOrders,
      daysBetweenOrders: segDaysBetween,
      avgOrderValue: segAov,
      totalSales: parseFloat(custValue.toFixed(2))
    };
  });

  return {
    kpis: {
      totalCustomers,
      firstTimeCustomers,
      returningCustomers,
      firstTimePercent: totalCustomers > 0 ? Math.round((firstTimeCustomers / totalCustomers) * 100) : 0,
      returningPercent: totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0,
      totalCustomerValue: parseFloat(totalCustomerValue.toFixed(2)),
      firstTimeValue: parseFloat(firstTimeValue.toFixed(2)),
      returningValue: parseFloat(returningValue.toFixed(2)),
      avgOrdersPerCustomer,
      firstTimeAvgOrders,
      returningAvgOrders,
      daysBetweenOrders,
      avgOrderValue,
      firstTimeAov,
      returningAov
    },
    scatterPoints,
    segmentSummaries,
    totalCustomerCount: totalCustomers
  };
}
