import { NextRequest, NextResponse } from "next/server";
import { kv } from "~/lib/kv";

export const fetchCache = "force-no-store";
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const startTime = Date.now();
  const value = await kv.get(key!);
  return NextResponse.json({
    value,
    timing_in_ms: Date.now() - startTime,
  });
}
