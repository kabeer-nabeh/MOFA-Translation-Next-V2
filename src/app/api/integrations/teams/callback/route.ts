import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth redirect URI for Microsoft. Wire your Azure app to this URL, then
 * add token exchange + tenant storage here. For now we forward to the client
 * completion step so the UI can show "Done".
 */
export function GET(request: NextRequest) {
  const u = new URL(
    "/settings/integrations/complete/teams",
    request.nextUrl.origin,
  );
  u.searchParams.set("source", "oauth");
  const code = request.nextUrl.searchParams.get("code");
  const err = request.nextUrl.searchParams.get("error");
  if (err) u.searchParams.set("error", err);
  if (code) u.searchParams.set("code", "1");
  return NextResponse.redirect(u);
}
