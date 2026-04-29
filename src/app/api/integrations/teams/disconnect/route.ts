import { NextResponse } from "next/server";

/**
 * TODO: Revoke Microsoft tokens and clear org integration on the server.
 * Client-only removal is not enough for production; this is the right hook.
 */
export async function POST() {
  await new Promise((r) => setTimeout(r, 450));
  return NextResponse.json({ ok: true as const });
}
