"use client";

import { useEffect } from "react";

/** Sends a verified buyer to the scheduling page. The fallback link stays in the markup. */
export default function BookingRedirect({ url }: { url: string }) {
  useEffect(() => {
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noreferrer";
    a.referrerPolicy = "no-referrer";
    document.body.appendChild(a);
    a.click();
    return () => a.remove();
  }, [url]);
  return <span data-auto-redirect="true" hidden />;
}
