/**
 * RFM Segmentation and Metrics Calculation Engine for "Customer Analytics: VIP & LTV"
 */

export const SEGMENT_DEFINITIONS = {
  NEW: {
    key: "new",
    name: "New",
    title: "New Customers",
    subtitle: "Made first order recently",
    color: "#3b82f6",
    lead: "First-time buyers on your store who made an order recently. Usually one of the most significant customer segments.",
    body: "The truth is that most customers never graduate to loyal. But this group is so large that having clear strategies for first-time buyers such as triggered welcome e-mails will pay dividends in the long term. Take it as an opportunity to start a new relationship, thank them for the purchase, assure they are satisfied and motivated to next purchase.",
    tactics: [
      "Send welcome e-mail",
      "Offer a small discount for the next purchase"
    ],
    action: "Send Welcome Discount"
  },
  ABOUT_TO_SLEEP: {
    key: "about_to_sleep",
    name: "About to Sleep",
    title: "About to Sleep",
    subtitle: "Made first order some time ago",
    color: "#d97706",
    lead: "Customers in this segment don't buy often and haven't made any orders recently. They are typically your New Customers who didn't make any additional orders, so they have been moved to this segment.",
    body: "Your primary goal with this group is to reactivate them. Let them know your business is still there. Often just a slight \"nudge\" will do the job. You can start softly by checking in on their last order and whether they need any help. You can also send them a newsletter with the latest or relevant products. Last but not least, try offering a small discount on their next order.",
    tactics: [
      "Check-in on the status of their last order",
      "Send e-mail newsletter including new/relevant products",
      "Offer a small discount for the next purchase"
    ],
    action: "Re-engage Customer"
  },
  SLEEPERS: {
    key: "sleepers",
    name: "Sleepers",
    title: "Sleepers",
    subtitle: "Made first order long time ago",
    color: "#6b7280",
    lead: "Customers in this segment are basically lost. They haven't bought in your store for a very long time, and it will be tough to win them back. For the established businesses, this group will likely be the biggest one.",
    body: "You have only one chance so that you can be really aggressive. We don't recommend running multiple campaigns on this segment as the ROI is generally low. The best practice is to offer a time-limited discount with a high discount amount. Ideally generated only for the particular customer.",
    tactics: [
      "Offer a time-limited discount at best possible value (i.e., the highest level of discount)",
      "Don't send the campaign too often, otherwise, your ROI will suffer"
    ],
    action: "Launch Win-back"
  },
  POTENTIAL_LOYAL: {
    key: "potential_loyal",
    name: "Potential Loyal",
    title: "Potential Loyal",
    subtitle: "Made more orders recently",
    color: "#10b981",
    lead: "Customers who recently made multiple orders and have the potential to become loyal. Few of them will organically become Loyal, while most will eventually become Sleepers.",
    body: "These customers are already very valuable due to their total spending and higher average order value. So don't be afraid to offer perks like gifts, free shipping, special membership, early access to sales, etc. Your goal is to make sure these customers will continue shopping with you at the same pace.",
    tactics: [
      "Offer upsells and cross-sells to increase the average spend",
      "Offer free gifts or free shipping for a particular spend threshold",
      "Offer special memberships or early access"
    ],
    action: "Invite to Loyalty"
  },
  LOYAL: {
    key: "loyal",
    name: "Loyal",
    title: "Loyal Customers",
    subtitle: "Making orders often and regularly",
    color: "#008060",
    lead: "These are your best customers who buy the most from your store. The group is small, but they deserve special attention.",
    body: "Your goal is to keep these customers engaged, so they continue shopping. They necessarily don't expect discounts, so don't offer them unless asked. They rather expect special treatment and top-notch customer service (almost \"white-glove\"). If this segment is relatively large, you can also consider establishing a loyalty program.",
    tactics: [
      "Offer latest products",
      "Provide top-notch customer service (no questions asked refunds, online chat, or phone)",
      "Send them a thank-you message from the business owner, and ask them what they would like to improve/change"
    ],
    action: "Send VIP Reward"
  },
  LOYAL_AT_RISK: {
    key: "loyal_at_risk",
    name: "Loyal at Risk",
    title: "Loyal at Risk",
    subtitle: "Previously Loyal not ordered recently",
    color: "#ef4444",
    lead: "These are your former loyal customers who haven't purchased in a while. They have been very active, but something happened. The typical tactics from other segments won't work here, so you really need to be personal here.",
    body: "Since this group is very likely the smallest group of all, take your time and e-mail or phone (better!) each customer to ask them what went wrong. Try to find out why they are no longer shopping in your store, but be authentic, not \"salesy.\"",
    tactics: [
      "Send personalized reactivation campaign",
      "E-mail or call to see what happened",
      "Offer a time-limited discount for relevant products based on their purchase behavior (i.e., renewals, complementary products)"
    ],
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
 * @param {string} shopCurrencyCode Shop currency code (e.g. "PKR", "USD", "EUR")
 * @returns {Object} Complete analytics calculation bundle
 */
export function computeRfmAnalytics(rawCustomers = [], shopCurrencyCode = "USD") {
  const now = new Date();

  const processedCustomers = rawCustomers.map((node) => {
    const ordersCount = parseInt(node.numberOfOrders || (node.orders?.nodes?.length || 0), 10) || 0;
    const totalSpent = parseFloat(node.amountSpent?.amount || "0") || 0;
    const currencyCode = node.amountSpent?.currencyCode || shopCurrencyCode;

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
      firstName: node.firstName || "",
      lastName: node.lastName || "",
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

  // Scatter plot points
  const scatterPoints = processedCustomers.map((c) => ({
    id: c.id,
    customerName: c.name,
    x: Number(c.daysSinceLastOrder || 0),
    y: Number(c.numberOfOrders || 0),
    segmentKey: c.segmentKey,
    segmentName: c.segmentName,
    color: c.segmentColor,
    totalSpent: Number(c.totalSpent || 0),
    currencyCode: shopCurrencyCode
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
      title: def.title || `${def.name} Customers`,
      subtitle: def.subtitle,
      color: def.color,
      lead: def.lead,
      body: def.body,
      tactics: def.tactics || [],
      tip: def.lead,
      action: def.action,
      customerCount: count,
      customerValue: parseFloat(custValue.toFixed(2)),
      avgOrders: segAvgOrders,
      daysBetweenOrders: segDaysBetween,
      avgOrderValue: segAov,
      totalSales: parseFloat(custValue.toFixed(2)),
      currencyCode: shopCurrencyCode,
      customerList: list
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
      returningAov,
      currencyCode: shopCurrencyCode
    },
    scatterPoints,
    segmentSummaries,
    totalCustomerCount: totalCustomers,
    currencyCode: shopCurrencyCode
  };
}
