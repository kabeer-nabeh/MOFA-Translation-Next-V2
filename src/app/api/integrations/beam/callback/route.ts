import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const u = new URL(
    "/settings/integrations/complete/beam",
    request.nextUrl.origin,
  );
  u.searchParams.set("source", "oauth");
  const err = request.nextUrl.searchParams.get("error");
  if (err) u.searchParams.set("error", err);
  return NextResponse.redirect(u);
}
