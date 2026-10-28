import { CALENDLY_URL } from "@/lib/foundingAgent";
export default function BookPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Book your 30-minute consultation</h1>
      <p className="mt-2 opacity-80">Pick a time that works for you.</p>
      <iframe title="Book with Pragvance" src={`${CALENDLY_URL}?hide_gdpr_banner=1`} className="mt-6 h-[720px] w-full rounded-xl bg-white" />
      <p className="mt-4 text-sm"><a className="underline" href={CALENDLY_URL} target="_blank" rel="noreferrer">Open the booking page in a new tab</a></p>
    </>
  );
}
