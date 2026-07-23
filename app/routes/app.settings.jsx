import { useState } from "react";
import { useLoaderData, useSubmit, useNavigation } from "react-router";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Checkbox,
  TextField,
  Button,
  Banner,
  BlockStack,
  Text,
  Box
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getAppSettings, updateAppSettings } from "../services/analytics.server";
import { applySegmentTagsToShopify } from "../services/tagging.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getAppSettings(session.shop);

  return { settings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "save_settings") {
    const autoRefresh = formData.get("autoRefresh") === "true";
    const autoTagging = formData.get("autoTagging") === "true";
    const emailReporting = formData.get("emailReporting") === "true";
    const reportEmails = formData.get("reportEmails") || "";
    const addSegmentsToCustomersPage = formData.get("addSegmentsToCustomersPage") === "true";

    const updatedSettings = await updateAppSettings(session.shop, {
      autoRefresh,
      autoTagging,
      emailReporting,
      reportEmails,
      addSegmentsToCustomersPage
    });

    return { success: true, message: "Settings saved successfully!", settings: updatedSettings };
  }

  if (intent === "run_tagging") {
    const tagResult = await applySegmentTagsToShopify(admin);
    return {
      success: true,
      message: `Successfully tagged ${tagResult.taggedCount} customers in Shopify Admin!`
    };
  }

  return { success: false };
};

export default function SettingsPage() {
  const { settings } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();

  const [autoRefresh, setAutoRefresh] = useState(settings?.autoRefresh ?? true);
  const [autoTagging, setAutoTagging] = useState(settings?.autoTagging ?? false);
  const [emailReporting, setEmailReporting] = useState(settings?.emailReporting ?? false);
  const [reportEmails, setReportEmails] = useState(settings?.reportEmails || "");
  const [addSegmentsToCustomersPage, setAddSegmentsToCustomersPage] = useState(settings?.addSegmentsToCustomersPage ?? true);

  const [bannerMessage, setBannerMessage] = useState("");

  const isSaving = navigation.state === "submitting" && navigation.formData?.get("intent") === "save_settings";
  const isTagging = navigation.state === "submitting" && navigation.formData?.get("intent") === "run_tagging";

  const handleSave = () => {
    const formData = new FormData();
    formData.append("intent", "save_settings");
    formData.append("autoRefresh", String(autoRefresh));
    formData.append("autoTagging", String(autoTagging));
    formData.append("emailReporting", String(emailReporting));
    formData.append("reportEmails", reportEmails);
    formData.append("addSegmentsToCustomersPage", String(addSegmentsToCustomersPage));

    submit(formData, { method: "post" });
    setBannerMessage("Settings updated successfully.");
  };

  const handleRunTagging = () => {
    const formData = new FormData();
    formData.append("intent", "run_tagging");
    submit(formData, { method: "post" });
    setBannerMessage("Triggered customer auto-tagging process...");
  };

  return (
    <Page
      title="Settings"
      subtitle="Configure automated refresh schedules, Shopify tagging, and email reports"
      primaryAction={{
        content: "Save Settings",
        loading: isSaving,
        onClick: handleSave
      }}
    >
      <BlockStack gap="500">
        {bannerMessage && (
          <Banner status="success" onDismiss={() => setBannerMessage("")}>
            <p>{bannerMessage}</p>
          </Banner>
        )}

        <Layout>
          {/* Card 1: Auto-refresh & Email Reports */}
          <Layout.Section>
            <Card padding="500">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd" fontWeight="bold">
                  Auto-refresh every week
                </Text>

                <FormLayout>
                  <Checkbox
                    label="Automatically run the analysis every week"
                    checked={autoRefresh}
                    onChange={(newVal) => setAutoRefresh(newVal)}
                    helpText="Keeps your RFM customer segments and retention metrics automatically updated."
                  />

                  <Checkbox
                    label="Automatically apply customer tags"
                    checked={autoTagging}
                    onChange={(newVal) => setAutoTagging(newVal)}
                    helpText="Automatically syncs segment tags (e.g. VIP-Loyal, VIP-New) to Shopify Customer profiles."
                  />

                  <Checkbox
                    label="Send email report every Monday"
                    checked={emailReporting}
                    onChange={(newVal) => setEmailReporting(newVal)}
                    helpText="Receive weekly RFM metrics and LTV performance directly in your inbox."
                  />

                  {emailReporting && (
                    <TextField
                      label="Report Recipient Emails"
                      value={reportEmails}
                      onChange={(newVal) => setReportEmails(newVal)}
                      placeholder="e.g. admin@example.com, marketing@example.com"
                      helpText="Enter up to 5 comma-separated email addresses."
                      autoComplete="off"
                    />
                  )}
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Card 2: Integration with Shopify */}
          <Layout.Section>
            <Card padding="500">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd" fontWeight="bold">
                  Integration with Shopify
                </Text>

                <FormLayout>
                  <Checkbox
                    label="Add customer segments to Customers page"
                    checked={addSegmentsToCustomersPage}
                    onChange={(newVal) => setAddSegmentsToCustomersPage(newVal)}
                    helpText="Enable segment filters and custom view badges on your Shopify Admin Customers page."
                  />
                </FormLayout>

                <Box paddingBlockStart="300">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" fontWeight="semibold">
                      Manual Tagging Sync
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Immediately push calculated RFM segment tags (e.g. VIP-Loyal, VIP-New, VIP-Sleepers) to all customers in Shopify Admin.
                    </Text>
                    <div>
                      <Button
                        loading={isTagging}
                        onClick={handleRunTagging}
                      >
                        Apply Customer Tags to Shopify Now
                      </Button>
                    </div>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
