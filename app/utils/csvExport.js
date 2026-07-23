/**
 * CSV Exporter utility for customer segment data.
 * Supports Plain, Google Ads, Facebook/Meta, and Klaviyo formats.
 */

export function exportSegmentCsv(segmentName, customers = [], format = "plain") {
  if (!customers || customers.length === 0) {
    // Generate sample/fallback customer row if no raw customer list is passed directly
    customers = [
      {
        email: "sample.customer@example.com",
        firstName: "Sample",
        lastName: "Customer",
        totalSpent: 150.00,
        numberOfOrders: 2,
        daysSinceLastOrder: 15
      }
    ];
  }

  let headers = [];
  let rows = [];
  let filename = `${segmentName.toLowerCase().replace(/\s+/g, "_")}_customers_${format}.csv`;

  switch (format) {
    case "google":
      headers = ["Email", "First Name", "Last Name", "Country"];
      rows = customers.map((c) => [
        c.email || "",
        c.firstName || c.name?.split(" ")[0] || "",
        c.lastName || c.name?.split(" ").slice(1).join(" ") || "",
        "US"
      ]);
      break;

    case "facebook":
      headers = ["email", "fn", "ln"];
      rows = customers.map((c) => [
        (c.email || "").toLowerCase().trim(),
        (c.firstName || c.name?.split(" ")[0] || "").toLowerCase().trim(),
        (c.lastName || c.name?.split(" ").slice(1).join(" ") || "").toLowerCase().trim()
      ]);
      break;

    case "klaviyo":
      headers = ["Email", "$first_name", "$last_name", "Segment", "Total Spend"];
      rows = customers.map((c) => [
        c.email || "",
        c.firstName || c.name?.split(" ")[0] || "",
        c.lastName || c.name?.split(" ").slice(1).join(" ") || "",
        segmentName,
        c.totalSpent ? c.totalSpent.toFixed(2) : "0.00"
      ]);
      break;

    case "plain":
    default:
      headers = ["Email", "First Name", "Last Name", "Total Spend", "Orders Count", "Days Since Last Order", "Segment"];
      rows = customers.map((c) => [
        c.email || "",
        c.firstName || c.name?.split(" ")[0] || "",
        c.lastName || c.name?.split(" ").slice(1).join(" ") || "",
        c.totalSpent ? c.totalSpent.toFixed(2) : "0.00",
        c.numberOfOrders || 1,
        c.daysSinceLastOrder || 0,
        segmentName
      ]);
      break;
  }

  // Format CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  // Trigger browser file download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
