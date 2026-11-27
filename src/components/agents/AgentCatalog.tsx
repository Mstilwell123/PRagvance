"use client";

import { useState } from "react";
import Link from "next/link";
import AgentPortrait from "@/components/agents/AgentPortrait";
import {
  AGENT_CATEGORIES,
  AGENTS,
  type AgentFilterId,
  agentPath,
  agentsForFilter,
  categoryLabel,
  statusLabel,
} from "@/lib/agents-a-la-carte";

export default function AgentCatalog() {
  const [filter, setFilter] = useState<AgentFilterId>("all");
  const groups =
    filter === "all"
      ? AGENT_CATEGORIES.filter((category) => category.id !== "all").map((category) => ({
          id: category.id,
          label: category.label,
          agents: agentsForFilter(category.id),
        }))
      : [
          {
            id: filter,
            label: AGENT_CATEGORIES.find((category) => category.id === filter)?.label ?? "All",
            agents: agentsForFilter(filter),
          },
        ];
  const visibleCount = groups.reduce((sum, group) => sum + group.agents.length, 0);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-semibold text-[color:var(--gold-bright)]">Choose an agent</h2>
        <p className="text-sm text-[color:var(--text-muted)]" aria-live="polite">
          {visibleCount} of {AGENTS.length} agents
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter agents by business outcome">
        {AGENT_CATEGORIES.map((category) => {
          const count = agentsForFilter(category.id).length;
          const selected = filter === category.id;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(category.id)}
              className={
                selected
                  ? "rounded-full bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-black"
                  : "rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--electric-bright)]"
              }
            >
              {category.label}
              <span className="ml-2 text-xs opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h3 id={`group-${group.id}`} className="text-lg font-semibold text-[color:var(--text)]">
              {group.label}
            </h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.agents.map((agent) => (
                <li key={agent.slug} className="min-w-0">
                  <Link
                    href={agentPath(agent.slug)}
                    className="panel gold-glow flex h-full flex-col p-5 motion-safe:transition motion-safe:duration-200 hover:border-[color:var(--gold-bright)] focus-visible:border-[color:var(--gold-bright)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <AgentPortrait slug={agent.slug} title={agent.title} />
                      <span
                        className={
                          agent.status === "available"
                            ? "shrink-0 rounded-full bg-[color:var(--gold)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black"
                            : "shrink-0 rounded-full border border-[color:var(--line)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[color:var(--gold-bright)]"
                        }
                      >
                        {statusLabel(agent.status)}
                      </span>
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-[color:var(--text)]">{agent.title}</h4>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--gold)]">
                      {categoryLabel(agent.category)}
                    </p>
                    <p className="mt-3 text-sm text-[color:var(--text-muted)]">{agent.summary}</p>
                    <p className="mt-3 text-sm text-[color:var(--text)]">
                      <span className="font-semibold text-[color:var(--gold-bright)]">Week-1 deliverable: </span>
                      {agent.weekOne}
                    </p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--electric-bright)]">
                      View this agent
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
