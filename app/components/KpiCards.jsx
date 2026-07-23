import { Card, Text, BlockStack, InlineGrid, Box } from "@shopify/polaris";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(amount || 0);
}

export default function KpiCards({ kpis }) {
  const {
    totalCustomers = 0,
    firstTimeCustomers = 0,
    returningCustomers = 0,
    firstTimePercent = 0,
    returningPercent = 0,
    totalCustomerValue = 0,
    firstTimeValue = 0,
    returningValue = 0,
    avgOrdersPerCustomer = 0,
    firstTimeAvgOrders = 1,
    returningAvgOrders = 0,
    daysBetweenOrders = 0,
    avgOrderValue = 0,
    firstTimeAov = 0,
    returningAov = 0
  } = kpis || {};

  return (
    <InlineGrid columns={{ xs: 1, sm: 2, md: 5 }} gap="400">
      {/* 1. Customers */}
      <Card padding="400">
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" tone="subdued">
            Customers
          </Text>
          <Text as="p" variant="headingLg" fontWeight="bold">
            {totalCustomers.toLocaleString()}
          </Text>
          <Box paddingBlockStart="100">
            <BlockStack gap="050">
              <Text as="span" variant="bodyXs" tone="subdued">
                First-time: {firstTimeCustomers} ({firstTimePercent}%)
              </Text>
              <Text as="span" variant="bodyXs" tone="subdued">
                Returning: {returningCustomers} ({returningPercent}%)
              </Text>
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>

      {/* 2. Customer value */}
      <Card padding="400">
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" tone="subdued">
            Customer value
          </Text>
          <Text as="p" variant="headingLg" fontWeight="bold">
            {formatCurrency(totalCustomerValue)}
          </Text>
          <Box paddingBlockStart="100">
            <BlockStack gap="050">
              <Text as="span" variant="bodyXs" tone="subdued">
                First-time: {formatCurrency(firstTimeValue)}
              </Text>
              <Text as="span" variant="bodyXs" tone="subdued">
                Returning: {formatCurrency(returningValue)}
              </Text>
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>

      {/* 3. Orders per customer */}
      <Card padding="400">
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" tone="subdued">
            Orders per customer
          </Text>
          <Text as="p" variant="headingLg" fontWeight="bold">
            {avgOrdersPerCustomer}
          </Text>
          <Box paddingBlockStart="100">
            <BlockStack gap="050">
              <Text as="span" variant="bodyXs" tone="subdued">
                First-time: {firstTimeAvgOrders}
              </Text>
              <Text as="span" variant="bodyXs" tone="subdued">
                Returning: {returningAvgOrders}
              </Text>
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>

      {/* 4. Days between orders */}
      <Card padding="400">
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" tone="subdued">
            Days between orders
          </Text>
          <Text as="p" variant="headingLg" fontWeight="bold">
            {daysBetweenOrders}
          </Text>
          <Box paddingBlockStart="100">
            <Text as="span" variant="bodyXs" tone="subdued">
              Average repeat purchase frequency
            </Text>
          </Box>
        </BlockStack>
      </Card>

      {/* 5. Average order value */}
      <Card padding="400">
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm" tone="subdued">
            Average order value
          </Text>
          <Text as="p" variant="headingLg" fontWeight="bold">
            {formatCurrency(avgOrderValue)}
          </Text>
          <Box paddingBlockStart="100">
            <BlockStack gap="050">
              <Text as="span" variant="bodyXs" tone="subdued">
                First-time: {formatCurrency(firstTimeAov)}
              </Text>
              <Text as="span" variant="bodyXs" tone="subdued">
                Returning: {formatCurrency(returningAov)}
              </Text>
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>
    </InlineGrid>
  );
}
