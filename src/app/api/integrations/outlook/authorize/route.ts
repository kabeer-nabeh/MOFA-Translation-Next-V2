import { NextRequest, NextResponse } from "next/server";

/**
 * Starts Microsoft Outlook / Microsoft 365 OAuth. Set OUTLOOK_OAUTH_AUTHORIZE_URL
 * to the full authorize URL. If unset, redirects to the in-app completion (demo).
 */
export function GET(request: NextRequest) {
  const external = process.env.OUTLOOK_OAUTH_AUTHORIZE_URL;
  if (external?.length) {
    return NextResponse.redirect(external);
  }
  const u = new URL(
    "/settings/integrations/complete/outlook",
    request.nextUrl.origin,
  );
  u.searchParams.set("source", "demo");
  return NextResponse.redirect(u);
}
