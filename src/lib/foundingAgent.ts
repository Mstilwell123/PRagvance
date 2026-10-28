export const AGENTS = [
  { id: "booker", name: "Booker", d: "Appointment booking" },
  { id: "helpline", name: "Helpline", d: "FAQ and inquiry replies" },
  { id: "follow-up", name: "Follow-up", d: "Quote and lead follow-up" },
  { id: "megaphone", name: "Megaphone", d: "Content repurposing" },
] as const;

export const CALENDLY_URL = "https://calendly.com/pragvance/30min";

export type Intake = { businessType: string; agent: string; task: string; tools: string };

export function validateIntake(body: unknown): { ok: true; data: Intake } | { ok: false; errors: Record<string, string> } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const s = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  const data = { businessType: s("businessType"), agent: s("agent"), task: s("task"), tools: s("tools") };
  const errors: Record<string, string> = {};
  if (!data.businessType) errors.businessType = "Business type is required.";
  else if (data.businessType.length > 200) errors.businessType = "Keep it under 200 characters.";
  if (!AGENTS.some((a) => a.id === data.agent)) errors.agent = "Pick an agent from the menu.";
  if (!data.task) errors.task = "Describe the task to automate.";
  else if (data.task.length > 2000) errors.task = "Keep it under 2000 characters.";
  if (!data.tools) errors.tools = "List the tools you use.";
  else if (data.tools.length > 1000) errors.tools = "Keep it under 1000 characters.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
