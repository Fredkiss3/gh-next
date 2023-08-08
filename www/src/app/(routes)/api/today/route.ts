import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  return NextResponse.json({
    time: Date.now(),
  });
}
