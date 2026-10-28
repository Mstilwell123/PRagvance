"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGENTS } from "@/lib/foundingAgent";

export default function IntakePage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    body.sessionId = new URLSearchParams(window.location.search).get("session_id") || "";
    const r = await fetch("/api/founding-agent/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (r.ok) return router.push("/founding-agent/book");
    const j = await r.json().catch(() => ({}));
    setErrors(j.errors || { form: "Something went wrong. Try again." });
  }
  const field = "mt-1 w-full rounded-lg border border-white/20 bg-transparent p-3";
  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-red-400">{errors[k]}</p>;
  return (
    <>
      <h1 className="text-3xl font-semibold">Tell us about your business</h1>
      <p className="mt-2 opacity-80">Four quick questions, then you book your consultation.</p>
      <form onSubmit={submit} noValidate className="mt-8 space-y-6">
        <label className="block">Business type<input name="businessType" className={field} />{err("businessType")}</label>
        <label className="block">Which agent?
          <select name="agent" defaultValue="crow" className={field}>
            {AGENTS.map((a) => <option key={a.id} value={a.id} className="text-black">{a.name}: {a.d}</option>)}
          </select>{err("agent")}
        </label>
        <label className="block">The task to automate<textarea name="task" rows={4} className={field} />{err("task")}</label>
        <label className="block">Tools you use<input name="tools" placeholder="e.g. Gmail, Google Calendar, Square" className={field} />{err("tools")}</label>
        {err("form")}
        <button disabled={busy} className="rounded-full bg-[color:var(--gold-bright,#d4af37)] px-6 py-3 font-semibold text-black">
          {busy ? "Saving…" : "Continue to booking"}
        </button>
      </form>
    </>
  );
}
