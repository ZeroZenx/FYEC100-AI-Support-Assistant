import { readFile } from "fs/promises";
import path from "path";

const PILOT_SESSIONS_PATH = path.join(process.cwd(), "data", "pilot-sessions.json");

export type PilotSessionStatus = "planned" | "not-started" | "in-progress" | "complete";

export type PilotSession = {
  audience: string;
  date: string;
  facilitator: string;
  goals: string[];
  id: string;
  mode: string;
  postChecks: string[];
  preChecks: string[];
  status: PilotSessionStatus;
  successCriteria: string[];
  title: string;
};

export type PilotSessionSummary = {
  nextSession?: PilotSession;
  path: string;
  sessions: PilotSession[];
  statusCounts: Record<PilotSessionStatus, number>;
  total: number;
};

export async function readPilotSessionSummary(): Promise<PilotSessionSummary> {
  const sessions = await readPilotSessions();
  const statusCounts: Record<PilotSessionStatus, number> = {
    complete: 0,
    "in-progress": 0,
    "not-started": 0,
    planned: 0
  };

  for (const session of sessions) {
    statusCounts[session.status] += 1;
  }

  return {
    nextSession: sessions.find((session) => session.status !== "complete"),
    path: "data/pilot-sessions.json",
    sessions,
    statusCounts,
    total: sessions.length
  };
}

async function readPilotSessions(): Promise<PilotSession[]> {
  const content = await readFile(PILOT_SESSIONS_PATH, "utf8");
  const parsed = JSON.parse(content) as PilotSession[];

  return parsed.map(normalizePilotSession);
}

function normalizePilotSession(session: PilotSession): PilotSession {
  return {
    ...session,
    goals: session.goals ?? [],
    postChecks: session.postChecks ?? [],
    preChecks: session.preChecks ?? [],
    status: normalizeStatus(session.status),
    successCriteria: session.successCriteria ?? []
  };
}

function normalizeStatus(status: string): PilotSessionStatus {
  const validStatuses: PilotSessionStatus[] = [
    "planned",
    "not-started",
    "in-progress",
    "complete"
  ];

  return validStatuses.includes(status as PilotSessionStatus)
    ? (status as PilotSessionStatus)
    : "planned";
}
