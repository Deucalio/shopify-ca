import { Banner } from "@shopify/polaris";
import { useState } from "react";

export default function WarningBanner({ totalCustomers }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || totalCustomers >= 50) {
    return null;
  }

  return (
    <Banner
      title="Sample Size Warning"
      status="warning"
      onDismiss={() => setDismissed(true)}
    >
      <p>
        Your store has less than the recommended number of 50 customers to provide reliable segmentation, so please interpret the data below with caution.
      </p>
    </Banner>
  );
}
