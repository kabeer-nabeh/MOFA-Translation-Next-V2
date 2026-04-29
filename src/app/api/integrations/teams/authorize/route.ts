import { NextRequest, NextResponse } from "next/server";

/**
 * Starts Teams OAuth. Set TEAMS_OAUTH_AUTHORIZE_URL to the full Microsoft authorize URL
 * (including query). If unset, redirects to the in-app completion step (demo / dev).
 */
export function GET(request: NextRequest) {
  const external = process.env.TEAMS_OAUTH_AUTHORIZE_URL;
  if (external?.length) {
    return NextResponse.redirect(external);
  }
  const u = new URL(
    "/settings/integrations/complete/teams",
    request.nextUrl.origin,
  );
  u.searchParams.set("source", "demo");
  return NextResponse.redirect(u);
}
