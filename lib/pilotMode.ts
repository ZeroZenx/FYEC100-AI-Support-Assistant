export type PilotMode = "demo" | "pilot";

export function getPilotMode(): PilotMode {
  const value = (process.env.PILOT_MODE ?? "demo").toLowerCase();

  return value === "pilot" ? "pilot" : "demo";
}

export function getPilotModeStatus() {
  const mode = getPilotMode();

  return {
    cleanupGuidance:
      mode === "pilot"
        ? "Export and review pilot records before using cleanup tools."
        : "Demo telemetry can be reset before rehearsals or sponsor walkthroughs.",
    configuredValue: process.env.PILOT_MODE ?? "demo",
    isPilot: mode === "pilot",
    mode,
    status: mode === "pilot" ? "controlled-pilot" : "demo",
    summary:
      mode === "pilot"
        ? "Controlled pilot mode is active. Treat feedback and launch records as pilot evidence."
        : "Demo mode is active. Use this for rehearsals, testing, and sponsor walkthroughs."
  };
}
