import { NextResponse } from "next/server";

/**
 * TODO: Revoke Microsoft Graph / Outlook tokens on the server.
 */
export async function POST() {
  await new Promise((r) => setTimeout(r, 450));
  return NextResponse.json({ ok: true as const });
}
