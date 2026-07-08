// Server-only session config for the shared-password gate.
import { useSession } from "@tanstack/react-start/server";
import { createHash } from "node:crypto";

export type GateSession = { unlocked?: boolean };

export function getGateSession() {
  const raw = process.env.SESSION_SECRET;
  if (!raw) throw new Error("SESSION_SECRET is not set");
  // Derive a 64-char hex key so any user-provided SESSION_SECRET length works.
  const password = createHash("sha256").update(raw, "utf8").digest("hex");
  return useSession<GateSession>({
    password,
    name: "hr-gate",
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      partitioned: true,
      path: "/",
    },
  });
}

