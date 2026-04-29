import { NextRequest, NextResponse } from "next/server";

/**
 * Starts Beam OAuth. Set BEAM_OAUTH_AUTHORIZE_URL to the provider’s authorize URL.
 * If unset, redirects to the in-app completion step (demo / dev).
 */
export function GET(request: NextRequest) {
  const external = process.env.BEAM_OAUTH_AUTHORIZE_URL;
  if (external?.length) {
    return NextResponse.redirect(external);
  }
  const u = new URL(
    "/settings/integrations/complete/beam",
    request.nextUrl.origin,
  );
  u.searchParams.set("source", "demo");
  return NextResponse.redirect(u);
}
