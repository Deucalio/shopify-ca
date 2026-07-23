import { useState, useEffect } from "react";
import { Card, Text, BlockStack, InlineStack, Box } from "@shopify/polaris";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const SEGMENT_LEGEND = [
  { key: "new", name: "New", color: "#008060" },
  { key: "about_to_sleep", name: "About to Sleep", color: "#E0B252" },
  { key: "sleepers", name: "Sleepers", color: "#6D7175" },
  { key: "potential_loyal", name: "Potential Loyal", color: "#2C6ECB" },
  { key: "loyal", name: "Loyal", color: "#5C6AC4" },
  { key: "loyal_at_risk", name: "Loyal at Risk", color: "#D9381E" }
];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #c9cccf",
          borderRadius: "8px",
          padding: "10px 14px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          fontSize: "13px",
          color: "#202223"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          {data.customerName}
        </div>
        <div style={{ color: data.color, fontWeight: "600", marginBottom: "6px" }}>
          Segment: {data.segmentName}
        </div>
        <div>Orders: <strong>{data.y}</strong></div>
        <div>Days since last order: <strong>{data.x} days</strong></div>
        <div>Total spent: <strong>${data.totalSpent?.toFixed(2)}</strong></div>
      </div>
    );
  }
  return null;
}

export default function RfmScatterChart({ points = [] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card padding="500">
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="050">
            <Text as="h2" variant="headingMd" fontWeight="bold">
              Customer segments scatter plot
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Visualization of customer Recency vs. Frequency. Hover dots to view customer metrics.
            </Text>
          </BlockStack>

          {/* Segment Legend */}
          <InlineStack gap="300" wrap>
            {SEGMENT_LEGEND.map((seg) => (
              <InlineStack gap="100" blockAlign="center" key={seg.key}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: seg.color,
                    display: "inline-block"
                  }}
                />
                <Text as="span" variant="bodyXs" tone="subdued">
                  {seg.name}
                </Text>
              </InlineStack>
            ))}
          </InlineStack>
        </InlineStack>

        <Box paddingBlockStart="200">
          {isClient ? (
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Days since last order"
                    domain={[0, 360]}
                    unit=" d"
                    label={{
                      value: "Days since last order",
                      position: "insideBottom",
                      offset: -10,
                      style: { fontSize: "12px", fill: "#6d7175" }
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Number of orders"
                    domain={[0, 8]}
                    unit=" orders"
                    label={{
                      value: "Number of orders",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fontSize: "12px", fill: "#6d7175" }
                    }}
                  />
                  <ZAxis type="number" range={[60, 60]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter name="Customers" data={points}>
                    {points.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#5C6AC4"} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              style={{
                height: 350,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6d7175"
              }}
            >
              Loading Chart...
            </div>
          )}
        </Box>
      </BlockStack>
    </Card>
  );
}
