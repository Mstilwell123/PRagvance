import { NextResponse } from "next/server";
import { CROW_PRIVATE_HEADERS, handleCrowDownload } from "@/lib/crow/access.server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const result = await handleCrowDownload(body);
  return NextResponse.json(result.body, { status: result.status, headers: CROW_PRIVATE_HEADERS });
}
