import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AgentDetail from "@/components/agents/AgentDetail";
import { AGENTS, agentBySlug, agentPath } from "@/lib/agents-a-la-carte";

export const dynamicParams = false;

export function generateStaticParams() {
  return AGENTS.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) {
    return { title: { absolute: "Agent | Pragvance.ai" } };
  }
  const path = agentPath(agent.slug);
  return {
    title: { absolute: `${agent.title} | Agents a la Carte | Pragvance.ai` },
    description: agent.summary,
    alternates: { canonical: path },
    openGraph: {
      title: `${agent.title} | Pragvance.ai`,
      description: agent.summary,
      url: path,
      images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
    },
  };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) notFound();
  return <AgentDetail agent={agent} />;
}
