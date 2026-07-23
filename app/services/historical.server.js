import { classifyCustomerSegment, SEGMENT_DEFINITIONS } from "./rfm.server";

/**
 * Computes 6-month historical trends for the 4 analytics charts.
 * 
 * @param {Array} rawCustomers List of raw customer nodes from Shopify GraphQL API
 * @returns {Object} Historical trend datasets for the 4 charts
 */
export function computeHistoricalTrends(rawCustomers = []) {
  const now = new Date();
  const months = [];

  // Generate last 6 month labels (e.g., ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"])
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    months.push({
      label,
      date: endOfMonth,
      monthIndex: d.getMonth(),
      year: d.getFullYear()
    });
  }

  // Pre-process customer order history
  const customersWithOrders = rawCustomers.map((node) => {
    const orders = (node.orders?.nodes || [])
      .map((o) => new Date(o.processedAt || o.createdAt))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a - b); // Ascending order (oldest first)

    const firstOrderDate = orders.length > 0 ? orders[0] : new Date(node.createdAt || now);
    const amountSpent = parseFloat(node.amountSpent?.amount || "0");

    return {
      id: node.id,
      name: `${node.firstName || ""} ${node.lastName || ""}`.trim() || node.email || "Customer",
      orders,
      firstOrderDate,
      totalSpent: amountSpent
    };
  });

  const chart1Customers = [];
  const chart2Retention = [];
  const chart3LoyalTrends = [];
  const chart4SegmentDistribution = [];

  months.forEach((m) => {
    let firstTimeCount = 0;
    let returningCount = 0;

    let loyalCount = 0;
    let potentialLoyalCount = 0;

    const segmentCounts = {
      new: 0,
      about_to_sleep: 0,
      sleepers: 0,
      potential_loyal: 0,
      loyal: 0,
      loyal_at_risk: 0
    };

    customersWithOrders.forEach((c) => {
      // Orders placed up to end of month m
      const ordersUpToMonth = c.orders.filter((oDate) => oDate <= m.date);
      const totalOrdersInMonthSpan = ordersUpToMonth.length;

      if (totalOrdersInMonthSpan === 0) return; // Not a customer yet

      // First-time vs returning check in month m
      const ordersInSpecificMonth = ordersUpToMonth.filter((oDate) => {
        return oDate.getMonth() === m.monthIndex && oDate.getFullYear() === m.year;
      });

      if (ordersInSpecificMonth.length > 0) {
        // Customer ordered during this month
        const isFirstOrderInThisMonth = c.firstOrderDate.getMonth() === m.monthIndex && c.firstOrderDate.getFullYear() === m.year;
        if (isFirstOrderInThisMonth && totalOrdersInMonthSpan === ordersInSpecificMonth.length) {
          firstTimeCount++;
        } else {
          returningCount++;
        }
      }

      // Calculate RFM segment state as of end of month m
      const lastOrderInSpan = ordersUpToMonth[ordersUpToMonth.length - 1];
      const daysDiff = Math.floor((m.date - lastOrderInSpan) / (1000 * 60 * 60 * 24));

      const seg = classifyCustomerSegment({
        numberOfOrders: totalOrdersInMonthSpan,
        daysSinceLastOrder: daysDiff
      });

      if (seg.key === "loyal") loyalCount++;
      if (seg.key === "potential_loyal") potentialLoyalCount++;
      if (segmentCounts[seg.key] !== undefined) {
        segmentCounts[seg.key]++;
      }
    });

    const activeInMonth = firstTimeCount + returningCount;
    const retentionRate = activeInMonth > 0 ? Math.round((returningCount / activeInMonth) * 100) : (firstTimeCount > 0 ? 30 : 50);

    // Chart 1: Customers (First-time vs Returning)
    chart1Customers.push({
      period: m.label,
      "First-time": firstTimeCount,
      "Returning": returningCount
    });

    // Chart 2: Retention rate over time
    chart2Retention.push({
      period: m.label,
      "Retention rate": retentionRate
    });

    // Chart 3: Loyal and potential loyal over time
    chart3LoyalTrends.push({
      period: m.label,
      "Loyal": loyalCount,
      "Potential Loyal": potentialLoyalCount
    });

    // Chart 4: Customers per segment (100% Stacked bar chart representation)
    const totalSegInMonth = Object.values(segmentCounts).reduce((a, b) => a + b, 0) || 1;
    chart4SegmentDistribution.push({
      period: m.label,
      "New": Math.round((segmentCounts.new / totalSegInMonth) * 100),
      "About to Sleep": Math.round((segmentCounts.about_to_sleep / totalSegInMonth) * 100),
      "Sleepers": Math.round((segmentCounts.sleepers / totalSegInMonth) * 100),
      "Potential Loyal": Math.round((segmentCounts.potential_loyal / totalSegInMonth) * 100),
      "Loyal": Math.round((segmentCounts.loyal / totalSegInMonth) * 100),
      "Loyal at Risk": Math.round((segmentCounts.loyal_at_risk / totalSegInMonth) * 100)
    });
  });

  return {
    chart1Customers,
    chart2Retention,
    chart3LoyalTrends,
    chart4SegmentDistribution
  };
}
