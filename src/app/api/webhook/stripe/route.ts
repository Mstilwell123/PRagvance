import { POST as existing } from "@/app/api/webhooks/stripe/route";

export const runtime = "nodejs";

/** Alias of POST /api/webhooks/stripe. Same signature check and handler. */
export const POST = existing;
