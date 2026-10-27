const link = "font-semibold hover:underline";

function GrokBotLink({ color }: { color: string }) {
  return (
    <a href="https://x.ai/bot" target="_blank" rel="noopener noreferrer" className={`${link} ${color}`}>
      Grok Bot
    </a>
  );
}

export default function GrokBotNote({
  boxClass,
  accent,
}: {
  boxClass: string;
  accent: string;
}) {
  return (
    <aside className={`rounded-xl p-4 text-sm text-[color:var(--text)] md:text-base ${boxClass}`} aria-label="Grok Bot setup">
      <p>
        We work exclusively with <GrokBotLink color={accent} />. You may want to set up your own
        ChatGPT account and your own <GrokBotLink color={accent} /> account.
      </p>
      <p className="mt-2 text-sm text-[color:var(--text-muted)]">
        Please don&apos;t use the Grok browser.{" "}
        <a href="https://cursor.com/download/bot" target="_blank" rel="noopener noreferrer" className={`${link} ${accent}`}>
          Download the Grok Bot desktop app
        </a>{" "}
        (Mac, Windows or Linux; iPhone and Android apps also exist). Desktop is needed for setup,
        because teaching by demonstration and testing routines only work there. The phone app is
        fine for everyday use afterward.
      </p>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Getting set up</p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-[color:var(--text-muted)]">
        <li>Choose an X Subscription plan of Premium or higher.</li>
        <li>
          Download from{" "}
          <a href="https://cursor.com/download/bot" target="_blank" rel="noopener noreferrer" className={`${link} ${accent}`}>
            cursor.com/download/bot
          </a>
          .
        </li>
        <li>Sign in through your browser.</li>
        <li>Pick your first bot during the short tour while your cloud computer sets up.</li>
      </ol>
    </aside>
  );
}
