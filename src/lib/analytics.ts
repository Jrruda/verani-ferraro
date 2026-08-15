type EcommerceEvent =
  | "view_item"
  | "view_item_list"
  | "select_item"
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "purchase"
  | "executive_set_select_watch"
  | "executive_set_select_glasses"
  | "executive_set_select_gift"
  | "executive_set_complete";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (action: string, event: string, payload?: Record<string, unknown>) => void;
  }
}

export function trackEvent(event: EcommerceEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("vf:analytics", {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  window.dataLayer?.push({ event, ...payload });
  window.fbq?.("trackCustom", event, payload);

  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, payload);
  }
}
