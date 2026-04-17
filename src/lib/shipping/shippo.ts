import { isShippoEnabled } from "@/lib/config";

export type ShippoRateQuoteInput = {
  fromAddressId: string;
  toAddressId: string;
  parcelTemplate: string;
};

export type ShippoLabelPurchaseInput = {
  rateId: string;
  orderId: string;
};

export type ShippoTrackingWebhookPayload = {
  event: string;
  data: unknown;
};

function assertShippoEnabled() {
  if (!isShippoEnabled()) {
    throw new Error("Shippo integration is not enabled for this environment.");
  }
}

export async function requestShippoRateQuotes(
  _input: ShippoRateQuoteInput,
): Promise<never> {
  assertShippoEnabled();
  // TODO: Wire up Shippo rate shopping once API credentials and address data are available.
  throw new Error("Shippo rate quoting is not implemented yet.");
}

export async function purchaseShippoLabel(
  _input: ShippoLabelPurchaseInput,
): Promise<never> {
  assertShippoEnabled();
  // TODO: Use Shippo purchase APIs to buy labels and persist label metadata.
  throw new Error("Shippo label purchasing is not implemented yet.");
}

export async function handleShippoTrackingWebhook(
  _payload: ShippoTrackingWebhookPayload,
): Promise<void> {
  assertShippoEnabled();
  // TODO: Parse Shippo tracking webhook payloads and update orders accordingly.
}
