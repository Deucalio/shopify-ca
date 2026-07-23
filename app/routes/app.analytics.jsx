import { useLoaderData } from "react-router";
import { Page, Layout, InlineGrid, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { fetchShopifyCustomers } from "../services/analytics.server";
import { computeHistoricalTrends } from "../services/historical.server";
import CustomersTrendChart from "../components/CustomersTrendChart";
import RetentionRateChart from "../components/RetentionRateChart";
import LoyalTrendsChart from "../components/LoyalTrendsChart";
import SegmentDistributionChart from "../components/SegmentDistributionChart";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const rawCustomers = await fetchShopifyCustomers(admin);
  const trends = computeHistoricalTrends(rawCustomers);

  return { trends };
};

export default function AnalyticsPage() {
  const { trends } = useLoaderData();
  const {
    chart1Customers = [],
    chart2Retention = [],
    chart3LoyalTrends = [],
    chart4SegmentDistribution = []
  } = trends || {};

  return (
    <Page
      fullWidth
      title="Analytics"
      subtitle="Historical RFM Customer Segments & Retention Trends"
    >
      <BlockStack gap="500">
        <Layout>
          {/* 2x2 Grid of Historical Data Charts */}
          <Layout.Section>
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <CustomersTrendChart data={chart1Customers} />
              <RetentionRateChart data={chart2Retention} />
              <LoyalTrendsChart data={chart3LoyalTrends} />
              <SegmentDistributionChart data={chart4SegmentDistribution} />
            </InlineGrid>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
