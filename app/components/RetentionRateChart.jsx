import { useState, useEffect } from "react";
import { Card, Text, BlockStack, Box } from "@shopify/polaris";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function RetentionRateChart({ data = [] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card padding="500">
      <BlockStack gap="300">
        <BlockStack gap="050">
          <Text as="h2" variant="headingMd" fontWeight="bold">
            Retention rate
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Percentage of active returning customers over time
          </Text>
        </BlockStack>

        <Box paddingBlockStart="200">
          {isClient ? (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="period" stroke="#6d7175" style={{ fontSize: "12px" }} />
                  <YAxis domain={[0, 100]} unit="%" stroke="#6d7175" style={{ fontSize: "12px" }} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Retention Rate"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #c9cccf"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="Retention rate"
                    stroke="#008060"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#008060" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
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
