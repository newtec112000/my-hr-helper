// Server-only session config for the shared-password gate.
import { useSession } from "@tanstack/react-start/server";

export type GateSession = { unlocked?: boolean };

export function getGateSession() {
  const password = process.env.SESSION_SECRET;
  if (!password) throw new Error("SESSION_SECRET is not set");
  return useSession<GateSession>({
    password,
    name: "hr-gate",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  });
}
