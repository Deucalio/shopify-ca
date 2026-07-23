import { useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  IndexTable,
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

export default function SegmentsTable({ summaries = [] }) {
  const submit = useSubmit();
  const [selectedTip, setSelectedTip] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const resourceName = {
    singular: "segment",
    plural: "segments"
  };

  const rowMarkup = summaries.map((row, index) => (
    <IndexTable.Row id={row.segmentKey} key={row.segmentKey} position={index}>
      {/* 1. Segment Name */}
      <IndexTable.Cell>
        <InlineStack gap="300" blockAlign="center" wrap={false}>
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
      </IndexTable.Cell>

      {/* 2. Customers count */}
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="medium">
          {row.customerCount.toLocaleString()}
        </Text>
      </IndexTable.Cell>

      {/* 3. Customer value */}
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {formatCurrency(row.customerValue)}
        </Text>
      </IndexTable.Cell>

      {/* 4. Avg. orders */}
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {row.avgOrders}
        </Text>
      </IndexTable.Cell>

      {/* 5. Days between orders */}
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {row.daysBetweenOrders > 0 ? `${row.daysBetweenOrders} days` : "-"}
        </Text>
      </IndexTable.Cell>

      {/* 6. Avg. order value */}
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {formatCurrency(row.avgOrderValue)}
        </Text>
      </IndexTable.Cell>

      {/* 7. Total sales */}
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="medium">
          {formatCurrency(row.totalSales)}
        </Text>
      </IndexTable.Cell>

      {/* 8. Actions / Tips */}
      <IndexTable.Cell>
        <InlineStack gap="150">
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
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

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
      <Box padding="400">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd" fontWeight="bold">
            Customer Segments RFM Matrix
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Detailed breakdown of customer count, value, orders, and repeat intervals across all 6 segments.
          </Text>
        </BlockStack>
      </Box>

      {actionSuccess && (
        <Box padding="400">
          <Banner status="success" onDismiss={() => setActionSuccess("")}>
            <p>{actionSuccess}</p>
          </Banner>
        </Box>
      )}

      <IndexTable
        resourceName={resourceName}
        itemCount={summaries.length}
        selectable={false}
        headings={[
          { title: "Segment Name" },
          { title: "Customers" },
          { title: "Customer Value" },
          { title: "Avg. Orders" },
          { title: "Days Between Orders" },
          { title: "Avg. Order Value" },
          { title: "Total Sales" },
          { title: "Growth & Actions" }
        ]}
      >
        {rowMarkup}
      </IndexTable>

      {/* Tips Modal */}
      {selectedTip && (
        <Modal
          open={Boolean(selectedTip)}
          onClose={() => setSelectedTip(null)}
          title={`Growth Strategy Tips: ${selectedTip.name}`}
          primaryAction={{
            content: "Got it",
            onClick: () => setSelectedTip(null)
          }}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <InlineStack gap="200" blockAlign="center">
                <Badge tone="info">{selectedTip.subtitle}</Badge>
                <Text as="span" variant="bodySm">
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
                Tagged customers can be used for targeted marketing campaigns, Shopify Flow automations, and customer group discounts.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Card>
  );
}
