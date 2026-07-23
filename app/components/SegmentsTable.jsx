import { useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Modal,
  Badge,
  Box,
  Banner
} from "@shopify/polaris";
import { useSubmit } from "react-router";

function formatCurrency(val) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const handleApplyTagging = (segmentKey) => {
    const formData = new FormData();
    formData.append("actionType", "tag_segment");
    formData.append("segmentKey", segmentKey);
    submit(formData, { method: "post" });
    setActionSuccess(`Queued customer tagging for segment: ${selectedAction?.name}`);
    setSelectedAction(null);
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
              <th style={{ padding: "14px 16px", textAlign: "right", minWidth: "160px" }}>Growth & Actions</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((row) => (
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
                    {formatCurrency(row.customerValue)}
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
                    {formatCurrency(row.avgOrderValue)}
                  </Text>
                </td>

                {/* 7. Total sales */}
                <td style={{ padding: "14px 12px", textAlign: "right" }}>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {formatCurrency(row.totalSales)}
                  </Text>
                </td>

                {/* 8. Growth & Actions Buttons */}
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <InlineStack gap="150" wrap={false} align="end">
                    <Button
                      size="slim"
                      onClick={() => setSelectedTip(row)}
                    >
                      Tips
                    </Button>
                    <Button
                      size="slim"
                      variant="primary"
                      onClick={() => setSelectedAction(row)}
                    >
                      Actions
                    </Button>
                  </InlineStack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tips Modal */}
      {selectedTip && (
        <Modal
          open={Boolean(selectedTip)}
          onClose={() => setSelectedTip(null)}
          title={`Growth Strategy Tips: ${selectedTip.name}`}
          primaryAction={{
            content: "Close",
            onClick: () => setSelectedTip(null)
          }}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <InlineStack gap="200" blockAlign="center">
                <Badge tone="info">{selectedTip.subtitle}</Badge>
                <Text as="span" variant="bodySm" tone="subdued">
                  ({selectedTip.customerCount} customers)
                </Text>
              </InlineStack>
              <Text as="p" variant="bodyMd">
                {selectedTip.tip}
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}

      {/* Actions Modal */}
      {selectedAction && (
        <Modal
          open={Boolean(selectedAction)}
          onClose={() => setSelectedAction(null)}
          title={`Segment Action: ${selectedAction.name}`}
          primaryAction={{
            content: `Apply "${selectedAction.name}" Customer Tags`,
            onClick: () => handleApplyTagging(selectedAction.segmentKey)
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onClick: () => setSelectedAction(null)
            }
          ]}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                Apply tag <strong>VIP-{selectedAction.name.replace(/\s+/g, "")}</strong> to all {selectedAction.customerCount} customers in this segment in your Shopify Admin.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Tagged customers can be used for targeted marketing campaigns, Shopify Flow automations, and custom customer group discounts.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Card>
  );
}
