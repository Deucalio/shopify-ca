import { useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Modal,
  Box,
  Banner,
  Popover,
  ActionList
} from "@shopify/polaris";
import { useSubmit } from "react-router";
import { exportSegmentCsv } from "../utils/csvExport";
import SegmentGridVisualization from "./SegmentGridVisualization";

function formatCurrency(val, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
    maximumFractionDigits: 2
  }).format(val || 0);
}

function formatAvgOrders(val) {
  const num = Number(val || 0);
  if (isNaN(num) || num > 1000) return "1.0";
  return num.toFixed(1);
}

export default function SegmentsTable({ summaries = [] }) {
  const submit = useSubmit();
  const [selectedTip, setSelectedTip] = useState(null);
  const [activePopoverKey, setActivePopoverKey] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const handleApplyTag = (row) => {
    const tagName = `loyal-app_${row.segmentKey}`;
    const formData = new FormData();
    formData.append("actionType", "tag_segment");
    formData.append("segmentKey", row.segmentKey);
    formData.append("tagName", tagName);
    submit(formData, { method: "post" });
    setActionSuccess(`Added tag "${tagName}" to customers in segment: ${row.name}`);
    setActivePopoverKey(null);
  };

  const handleDownloadCsv = (row, format) => {
    exportSegmentCsv(row.name, row.customerList || [], format);
    setActionSuccess(`Downloaded ${format.toUpperCase()} CSV for segment: ${row.name}`);
    setActivePopoverKey(null);
  };

  return (
    <Card padding="0">
      <Box padding="500">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd" fontWeight="bold">
            Customer Segments RFM Matrix
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Detailed breakdown of customer count, total value, average orders, repeat intervals, and sales across all 6 segments.
          </Text>
        </BlockStack>
      </Box>

      {actionSuccess && (
        <Box paddingInline="500" paddingBlockEnd="400">
          <Banner status="success" onDismiss={() => setActionSuccess("")}>
            <p>{actionSuccess}</p>
          </Banner>
        </Box>
      )}

      {/* Responsive Table Wrapper */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "14px",
            color: "#202223"
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f7f7f7",
                borderTop: "1px solid #e1e3e5",
                borderBottom: "1px solid #e1e3e5",
                color: "#6d7175",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              <th style={{ padding: "14px 16px", minWidth: "180px" }}>Segment Name</th>
              <th style={{ padding: "14px 12px", textAlign: "right" }}>Customers</th>
              <th style={{ padding: "14px 12px", textAlign: "right" }}>Customer Value</th>
              <th style={{ padding: "14px 12px", textAlign: "right" }}>Avg. Orders</th>
              <th style={{ padding: "14px 12px", textAlign: "right" }}>Days Between Orders</th>
              <th style={{ padding: "14px 12px", textAlign: "right" }}>Avg. Order Value</th>
              <th style={{ padding: "14px 12px", textAlign: "right" }}>Total Sales</th>
              <th style={{ padding: "14px 16px", textAlign: "right", minWidth: "170px" }}>Growth & Actions</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((row) => {
              const isPopoverOpen = activePopoverKey === row.segmentKey;
              const currencyCode = row.currencyCode || "USD";

              return (
                <tr
                  key={row.segmentKey}
                  style={{
                    borderBottom: "1px solid #e1e3e5",
                    transition: "background-color 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* 1. Segment Name */}
                  <td style={{ padding: "14px 16px" }}>
                    <InlineStack gap="200" blockAlign="center" wrap={false}>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: row.color,
                          flexShrink: 0
                        }}
                      />
                      <BlockStack gap="050">
                        <Text as="span" variant="bodyMd" fontWeight="bold">
                          {row.name}
                        </Text>
                        <Text as="span" variant="bodyXs" tone="subdued">
                          {row.subtitle}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                  </td>

                  {/* 2. Customers count */}
                  <td style={{ padding: "14px 12px", textAlign: "right" }}>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      {row.customerCount.toLocaleString()}
                    </Text>
                  </td>

                  {/* 3. Customer value */}
                  <td style={{ padding: "14px 12px", textAlign: "right" }}>
                    <Text as="span" variant="bodyMd">
                      {formatCurrency(row.customerValue, currencyCode)}
                    </Text>
                  </td>

                  {/* 4. Avg. orders */}
                  <td style={{ padding: "14px 12px", textAlign: "right" }}>
                    <Text as="span" variant="bodyMd">
                      {formatAvgOrders(row.avgOrders)}
                    </Text>
                  </td>

                  {/* 5. Days between orders */}
                  <td style={{ padding: "14px 12px", textAlign: "right" }}>
                    <Text as="span" variant="bodyMd">
                      {row.daysBetweenOrders > 0 ? `${row.daysBetweenOrders} days` : "-"}
                    </Text>
                  </td>

                  {/* 6. Avg. order value */}
                  <td style={{ padding: "14px 12px", textAlign: "right" }}>
                    <Text as="span" variant="bodyMd">
                      {formatCurrency(row.avgOrderValue, currencyCode)}
                    </Text>
                  </td>

                  {/* 7. Total sales */}
                  <td style={{ padding: "14px 12px", textAlign: "right" }}>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      {formatCurrency(row.totalSales, currencyCode)}
                    </Text>
                  </td>

                  {/* 8. Actions & Growth Menu */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <InlineStack gap="150" wrap={false} align="end">
                      <Button
                        size="slim"
                        onClick={() => setSelectedTip(row)}
                      >
                        Tips
                      </Button>

                      {/* Green Actions Dropdown Popover */}
                      <Popover
                        active={isPopoverOpen}
                        activator={
                          <Button
                            size="slim"
                            variant="primary"
                            disclosure
                            onClick={() =>
                              setActivePopoverKey(isPopoverOpen ? null : row.segmentKey)
                            }
                          >
                            Actions
                          </Button>
                        }
                        onClose={() => setActivePopoverKey(null)}
                      >
                        <ActionList
                          actionRole="menuitem"
                          items={[
                            {
                              content: `Add tag "loyal-app_${row.segmentKey}"`,
                              onAction: () => handleApplyTag(row)
                            },
                            {
                              content: "Download CSV (plain)",
                              onAction: () => handleDownloadCsv(row, "plain")
                            },
                            {
                              content: "Download CSV (Google Ads)",
                              onAction: () => handleDownloadCsv(row, "google")
                            },
                            {
                              content: "Download CSV (Facebook)",
                              onAction: () => handleDownloadCsv(row, "facebook")
                            },
                            {
                              content: "Download CSV (Klaviyo)",
                              onAction: () => handleDownloadCsv(row, "klaviyo")
                            }
                          ]}
                        />
                      </Popover>
                    </InlineStack>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Redesigned Tips Modal matching Screenshots */}
      {selectedTip && (
        <Modal
          open={Boolean(selectedTip)}
          onClose={() => setSelectedTip(null)}
          title={selectedTip.title || `${selectedTip.name} Customers`}
          primaryAction={{
            content: "Close",
            onClick: () => setSelectedTip(null)
          }}
        >
          <Modal.Section>
            <BlockStack gap="400">
              {/* Detailed Lead Text */}
              <Text as="p" variant="bodyMd">
                <strong>{selectedTip.lead}</strong>
              </Text>

              {/* Detailed Body Explanation */}
              <Text as="p" variant="bodyMd">
                {selectedTip.body}
              </Text>

              <Text as="p" variant="bodySm" tone="subdued">
                Learn more about how we segment{" "}
                <a
                  href="#segment-info"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: "#2c6ecb", textDecoration: "underline" }}
                >
                  customers
                </a>
                .
              </Text>

              {/* Recommended Actions & Tactics */}
              {selectedTip.tactics && selectedTip.tactics.length > 0 && (
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" fontWeight="bold">
                    Recommended actions and tactics
                  </Text>
                  <ul style={{ paddingLeft: "20px", margin: 0 }}>
                    {selectedTip.tactics.map((tactic, i) => (
                      <li key={i} style={{ marginBottom: "6px", fontSize: "14px" }}>
                        {tactic}
                      </li>
                    ))}
                  </ul>
                </BlockStack>
              )}

              {/* 5x5 RFM Matrix Grid Visualization */}
              <SegmentGridVisualization activeSegmentKey={selectedTip.segmentKey} />
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Card>
  );
}
