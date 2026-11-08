import { NextResponse, type NextRequest } from "next/server";
import { CROW_PRIVATE_HEADERS, handleCrowFile } from "@/lib/crow/access.server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const result = await handleCrowFile(req.nextUrl.searchParams.get("token"));
  if (result.status !== 200 || !result.bytes) {
    return NextResponse.json(result.body, { status: result.status, headers: CROW_PRIVATE_HEADERS });
  }
  return new NextResponse(Buffer.from(result.bytes), {
    status: 200,
    headers: {
      ...CROW_PRIVATE_HEADERS,
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="crow-template.md"',
    },
  });
}
