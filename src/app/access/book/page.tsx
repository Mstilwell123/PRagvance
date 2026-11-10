import type { Metadata } from "next";
import BookingPanel from "@/components/BookingPanel";
import { loadBookingPage, sessionIdFromQuery } from "@/lib/checkout/booking.server";

export const metadata: Metadata = {
  title: "Book your consultation",
  description: "Schedule a paid Pragvance consultation.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccessBookPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const view = await loadBookingPage(sessionIdFromQuery(params.session_id));
  return <BookingPanel view={view} />;
}
