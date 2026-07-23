import { fetchShopifyCustomers } from "./analytics.server";
import { classifyCustomerSegment } from "./rfm.server";

const TAGS_ADD_MUTATION = `#graphql
  mutation addTagsToCustomer($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Pushes customer segment tags back to Shopify Customer API.
 * 
 * @param {Object} admin Shopify Admin GraphQL client
 * @param {string} targetSegmentKey Optional segment key (or null for all segments)
 * @returns {Object} Tagging results summary
 */
export async function applySegmentTagsToShopify(admin, targetSegmentKey = null) {
  const rawCustomers = await fetchShopifyCustomers(admin);
  let taggedCount = 0;
  let errorCount = 0;

  for (const node of rawCustomers) {
    const ordersCount = node.numberOfOrders || (node.orders?.nodes?.length || 0);
    const amountSpent = parseFloat(node.amountSpent?.amount || "0");
    
    // Calculate last order days
    const now = new Date();
    const orderDates = (node.orders?.nodes || [])
      .map((o) => new Date(o.processedAt || o.createdAt))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => b - a);

    let daysSinceLastOrder = 999;
    if (orderDates.length > 0) {
      daysSinceLastOrder = Math.floor(Math.abs(now - orderDates[0]) / (1000 * 60 * 60 * 24));
    }

    const seg = classifyCustomerSegment({
      numberOfOrders: ordersCount,
      daysSinceLastOrder,
      totalSpent: amountSpent
    });

    if (!targetSegmentKey || seg.key === targetSegmentKey) {
      const tagToApply = `VIP-${seg.name.replace(/\s+/g, "")}`;
      
      try {
        const response = await admin.graphql(TAGS_ADD_MUTATION, {
          variables: {
            id: node.id,
            tags: [tagToApply]
          }
        });

        const json = await response.json();
        if (json?.data?.tagsAdd?.userErrors?.length > 0) {
          errorCount++;
        } else {
          taggedCount++;
        }
      } catch (err) {
        console.error(`Error tagging customer ${node.id}:`, err);
        errorCount++;
      }
    }
  }

  return {
    success: true,
    taggedCount,
    errorCount
  };
}
