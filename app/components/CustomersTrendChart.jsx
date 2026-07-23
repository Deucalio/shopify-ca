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

export default function CustomersTrendChart({ data = [] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card padding="500">
      <BlockStack gap="300">
        <BlockStack gap="050">
          <Text as="h2" variant="headingMd" fontWeight="bold">
            Customers
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            First-time vs. Returning customers count over time
          </Text>
        </BlockStack>

        <Box paddingBlockStart="200">
          {isClient ? (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="period" stroke="#6d7175" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6d7175" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #c9cccf"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="First-time" stackId="a" fill="#008060" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Returning" stackId="a" fill="#5C6AC4" radius={[4, 4, 0, 0]} />
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
