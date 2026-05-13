"use client";

import { useEffect } from "react";
import type { MoodleLaunchContext } from "@/lib/moodleContext";

export function MoodleLaunchAuditBeacon({
  launchContext
}: {
  launchContext: MoodleLaunchContext;
}) {
  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/launch-audit", {
      body: JSON.stringify({
        context: launchContext,
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: controller.signal
    }).catch(() => {
      // Launch audit is best-effort pilot telemetry and should not block students.
    });

    return () => controller.abort();
  }, [launchContext]);

  return null;
}
