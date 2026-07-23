import { Box, Text } from "@shopify/polaris";

/**
 * 5x5 Grid Mapping matching the exact RFM segment boundaries:
 * Row 5 (Orders 5+): Col 1-2 Loyal | Col 3-5 Loyal at Risk
 * Row 4 (Orders 3-4): Col 1-2 Loyal | Col 3-5 Loyal at Risk
 * Row 3 (Orders 2): Col 1-2 Potential Loyal | Col 3 About to Sleep | Col 4-5 Sleepers
 * Row 2 (Orders 1 mid): Col 1-2 Potential Loyal | Col 3 About to Sleep | Col 4-5 Sleepers
 * Row 1 (Orders 1 recent): Col 1 New | Col 2-3 About to Sleep | Col 4-5 Sleepers
 */
const GRID_LAYOUT = [
  // Row 5 (Top: Orders 5+)
  [
    { segKey: "loyal", label: "" },
    { segKey: "loyal", label: "" },
    { segKey: "loyal_at_risk", label: "" },
    { segKey: "loyal_at_risk", label: "" },
    { segKey: "loyal_at_risk", label: "" }
  ],
  // Row 4 (Orders 3-4)
  [
    { segKey: "loyal", label: "Loyal" },
    { segKey: "loyal", label: "" },
    { segKey: "loyal_at_risk", label: "" },
    { segKey: "loyal_at_risk", label: "Loyal at Risk" },
    { segKey: "loyal_at_risk", label: "" }
  ],
  // Row 3 (Orders 2)
  [
    { segKey: "potential_loyal", label: "" },
    { segKey: "potential_loyal", label: "" },
    { segKey: "about_to_sleep", label: "" },
    { segKey: "sleepers", label: "" },
    { segKey: "sleepers", label: "" }
  ],
  // Row 2 (Orders 1 - Mid Recency)
  [
    { segKey: "potential_loyal", label: "" },
    { segKey: "potential_loyal", label: "Potential Loyal" },
    { segKey: "about_to_sleep", label: "About to sleep" },
    { segKey: "sleepers", label: "Sleepers" },
    { segKey: "sleepers", label: "" }
  ],
  // Row 1 (Bottom: Orders 1 - Recent vs Past)
  [
    { segKey: "new", label: "New" },
    { segKey: "about_to_sleep", label: "" },
    { segKey: "about_to_sleep", label: "" },
    { segKey: "sleepers", label: "" },
    { segKey: "sleepers", label: "" }
  ]
];

const PASTEL_COLORS = {
  new: "#e6f0ff",
  about_to_sleep: "#fdf8e6",
  sleepers: "#f1f2f3",
  potential_loyal: "#e6f4ea",
  loyal: "#e8f5e9",
  loyal_at_risk: "#fce8e6"
};

const ACTIVE_COLORS = {
  new: "#3b82f6",
  about_to_sleep: "#d97706",
  sleepers: "#9ca3af",
  potential_loyal: "#52c480",
  loyal: "#008060",
  loyal_at_risk: "#ef4444"
};

export default function SegmentGridVisualization({ activeSegmentKey }) {
  return (
    <Box paddingBlockStart="300" paddingBlockEnd="200">
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Text as="h3" variant="headingSm" fontWeight="bold">
          Segment visualization
        </Text>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Y-axis label */}
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "12px",
              color: "#6d7175",
              fontWeight: "600",
              textAlign: "center"
            }}
          >
            Number of orders →
          </div>

          {/* 5x5 Grid Container */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
                backgroundColor: "#fff",
                padding: "8px",
                borderRadius: "12px",
                border: "1px solid #e1e3e5"
              }}
            >
              {GRID_LAYOUT.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isActive = cell.segKey === activeSegmentKey;
                  const bgColor = isActive
                    ? ACTIVE_COLORS[cell.segKey] || "#3b82f6"
                    : PASTEL_COLORS[cell.segKey] || "#f4f6f8";

                  return (
                    <div
                      key={`grid-${rIdx}-${cIdx}`}
                      style={{
                        height: "64px",
                        backgroundColor: bgColor,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        transition: "all 0.2s ease",
                        boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.12)" : "none"
                      }}
                    >
                      {cell.label && (
                        <div
                          style={{
                            backgroundColor: "#f1f2f4",
                            color: "#202223",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            zIndex: 10
                          }}
                        >
                          {cell.label}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* X-axis label */}
            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "12px",
                color: "#6d7175",
                fontWeight: "600"
              }}
            >
              Days since last order →
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
}
