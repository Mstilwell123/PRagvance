import { FAQ } from "@/lib/site";

export default function Faq({ title = "FAQ" }: { title?: string }) {
  return (
    <section aria-labelledby="faq-heading" className="section-pad mx-auto max-w-6xl py-16">
      <h2 id="faq-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)] md:text-3xl">
        {title}
      </h2>
      <div className="mt-8 space-y-4">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="panel group open:gold-glow px-5 py-4"
          >
            <summary className="cursor-pointer list-none font-medium text-[color:var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                <span>{item.q}</span>
                <span className="text-[color:var(--electric-bright)] transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
