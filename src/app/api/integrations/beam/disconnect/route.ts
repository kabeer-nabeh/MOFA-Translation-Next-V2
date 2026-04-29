import { NextResponse } from "next/server";

/**
 * TODO: Revoke Beam tokens and clear integration on the server.
 */
export async function POST() {
  await new Promise((r) => setTimeout(r, 450));
  return NextResponse.json({ ok: true as const });
}
