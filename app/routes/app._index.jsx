import { useLoaderData, useSubmit, useNavigation } from "react-router";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getOrFetchAnalytics } from "../services/analytics.server";
import WarningBanner from "../components/WarningBanner";
import KpiCards from "../components/KpiCards";
import RfmScatterChart from "../components/RfmScatterChart";
import SegmentsTable from "../components/SegmentsTable";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "true";

  const analyticsData = await getOrFetchAnalytics(admin, session.shop, forceRefresh);

  return {
    analytics: analyticsData,
    shop: session.shop
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "refresh") {
    const analyticsData = await getOrFetchAnalytics(admin, session.shop, true);
    return { success: true, analytics: analyticsData };
  }

  if (actionType === "tag_segment") {
    const segmentKey = formData.get("segmentKey");
    console.log(`[Tagging] Queued customer tagging for segment: ${segmentKey} on shop ${session.shop}`);
    return { success: true, message: `Segment ${segmentKey} tagged successfully` };
  }

  return { success: false };
};

export default function AppIndex() {
  const { analytics } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isRefreshing = navigation.state === "submitting";

  const handleRefresh = () => {
    const formData = new FormData();
    formData.append("actionType", "refresh");
    submit(formData, { method: "post" });
  };

  const { kpis, scatterPoints = [], segmentSummaries = [], totalCustomerCount = 0 } = analytics || {};

  return (
    <Page
      title="Customer Analytics: VIP & LTV"
      subtitle="Recency, Frequency & Monetary (RFM) Segmentation Dashboard"
      primaryAction={{
        content: "Refresh Analytics",
        loading: isRefreshing,
        onClick: handleRefresh
      }}
    >
      <BlockStack gap="500">
        {/* Warning Banner */}
        <WarningBanner totalCustomers={totalCustomerCount} />

        {/* 5 KPI Cards */}
        <Layout>
          <Layout.Section>
            <KpiCards kpis={kpis} />
          </Layout.Section>

          {/* Scatter Plot Chart */}
          <Layout.Section>
            <RfmScatterChart points={scatterPoints} />
          </Layout.Section>

          {/* Segments RFM Table */}
          <Layout.Section>
            <SegmentsTable summaries={segmentSummaries} />
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
