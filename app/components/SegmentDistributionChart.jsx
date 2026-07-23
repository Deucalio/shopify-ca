import { useState, useEffect } from "react";
import { Card, Text, BlockStack, Box } from "@shopify/polaris";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function SegmentDistributionChart({ data = [] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card padding="500">
      <BlockStack gap="300">
        <BlockStack gap="050">
          <Text as="h2" variant="headingMd" fontWeight="bold">
            Customers per segment
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            100% stacked distribution breakdown across all 6 segments over time
          </Text>
        </BlockStack>

        <Box paddingBlockStart="200">
          {isClient ? (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="period" stroke="#6d7175" style={{ fontSize: "12px" }} />
                  <YAxis domain={[0, 100]} unit="%" stroke="#6d7175" style={{ fontSize: "12px" }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Percentage"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #c9cccf"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="New" stackId="a" fill="#008060" />
                  <Bar dataKey="About to Sleep" stackId="a" fill="#E0B252" />
                  <Bar dataKey="Sleepers" stackId="a" fill="#6D7175" />
                  <Bar dataKey="Potential Loyal" stackId="a" fill="#2C6ECB" />
                  <Bar dataKey="Loyal" stackId="a" fill="#5C6AC4" />
                  <Bar dataKey="Loyal at Risk" stackId="a" fill="#D9381E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#6d7175" }}>
              Loading Chart...
            </div>
          )}
        </Box>
      </BlockStack>
    </Card>
  );
}
