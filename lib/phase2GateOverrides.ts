import { readFile, writeFile } from "fs/promises";
import path from "path";

const OVERRIDES_PATH = path.join(process.cwd(), "data", "phase-2-gate-overrides.json");

export type Phase2GateOverrides = {
  adminProtectionLocalOnly?: {
    acceptedAt: string;
    acceptedBy: string;
    note: string;
  };
};

export async function readPhase2GateOverrides(): Promise<Phase2GateOverrides> {
  try {
    return JSON.parse(await readFile(OVERRIDES_PATH, "utf8")) as Phase2GateOverrides;
  } catch {
    return {};
  }
}

export async function markAdminProtectionLocalOnly(input: {
  acceptedBy?: string;
  note?: string;
}) {
  const overrides = await readPhase2GateOverrides();
  const next: Phase2GateOverrides = {
    ...overrides,
    adminProtectionLocalOnly: {
      acceptedAt: new Date().toISOString(),
      acceptedBy: input.acceptedBy?.trim() || "Project Lead",
      note:
        input.note?.trim() ||
        "Phase 2 local-only mode acknowledged. Configure ADMIN_ACCESS_TOKEN before hosted pilot use."
    }
  };

  await writeFile(OVERRIDES_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return next;
}
