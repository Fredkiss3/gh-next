import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  return NextResponse.json({
    time: Date.now(),
    timing_in_ms: Date.now() - startTime,
  });
}
