"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type TrackableEvent = Parameters<typeof trackEvent>[0];

export function EventTracker({ event, payload }: { event: TrackableEvent; payload?: Record<string, unknown> }) {
  const serializedPayload = JSON.stringify(payload ?? {});

  useEffect(() => {
    trackEvent(event, JSON.parse(serializedPayload) as Record<string, unknown>);
  }, [event, serializedPayload]);

  return null;
}
