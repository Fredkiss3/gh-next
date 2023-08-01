import { NextResponse } from "next/server";
import { SqliteKV } from "~/lib/kv/sqlite";

export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  const kv = new SqliteKV();
  await kv.deleteExpiredCacheEntries();

  return NextResponse.json({
    ok: true,
  });
}
