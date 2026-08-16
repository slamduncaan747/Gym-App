import { COACH_SYSTEM_PROMPT } from '../store/seed.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';
const MAX_TOOL_ROUNDS = 4;

const TOOLS = [
  {
    name: 'save_memory',
    description: "Save a durable fact or short-term note about the user's training to long-term memory, to be considered in future workouts and conversations.",
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The fact to remember, written concisely in third person.' },
        category: { type: 'string', enum: ['long_term', 'temporary'] },
        expires_in_days: { type: 'integer', description: 'Required if category is temporary; omit for long_term.' }
      },
      required: ['text', 'category']
    }
  },
  {
    name: 'apply_programming',
    description: 'Propose a change to the plan shown on the Today screen. This does not change anything by itself — it attaches an Apply button to your reply so the user can apply it themselves.',
    input_schema: {
      type: 'object',
      properties: {
        plan: { type: 'string', enum: ['base', 'short', 'nobar', 'sore', 'back', 'squat'] },
        button_label: { type: 'string', description: 'Short label for the apply button, e.g. "Apply to my plan"' },
        rationale: { type: 'string', description: 'One short sentence shown on the Today screen explaining the change.' }
      },
      required: ['plan', 'button_label', 'rationale']
    }
  }
];

function buildContextBlock(ctx) {
  const lines = [];
  lines.push(`Today: ${ctx.today} (${ctx.weekday})`);
  lines.push(`Current plan: ${ctx.planTitle}`);
  lines.push('');
  lines.push('Recent sessions (most recent first):');
  ctx.recentSessions.forEach(s => {
    const topSets = s.sets.slice(0, 4).map(x => `${x.exercise} ${x.weight}x${x.reps}`).join(', ');
    lines.push(`- ${s.date}: ${s.title} — ${topSets}${s.sets.length > 4 ? ', …' : ''}`);
  });
  lines.push('');
  lines.push('This week\'s sets by muscle group: ' + ctx.volume.map(v => `${v.muscle} ${v.done} (target ${v.mev}-${v.mrv})`).join(', '));
  lines.push(`Consistency streak: ${ctx.streak} weeks`);
  lines.push('');
  lines.push('Memory:');
  ctx.memories.forEach(m => lines.push(`- [${m.category}] ${m.text}${m.expiresAt ? ' (expires ' + m.expiresAt + ')' : ''}`));
  return lines.join('\n');
}

export class CoachError extends Error {}

export async function askCoach({ apiKey, context, history, userText, onToolEffect }) {
  if (!apiKey) throw new CoachError('missing-key');

  const messages = history.map(m => ({ role: m.me ? 'user' : 'assistant', content: m.text }))
    .concat([{ role: 'user', content: userText }]);

  const system = COACH_SYSTEM_PROMPT + '\n\n--- Current user data ---\n' + buildContextBlock(context);

  let round = 0;
  let pendingAction = null;

  while (round++ < MAX_TOOL_ROUNDS) {
    let resp;
    try {
      resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({ model: MODEL, max_tokens: 700, system, tools: TOOLS, messages })
      });
    } catch {
      throw new CoachError('network');
    }
    if (resp.status === 401 || resp.status === 403) throw new CoachError('auth');
    if (!resp.ok) throw new CoachError('api:' + resp.status);
    const data = await resp.json();

    const toolUses = data.content.filter(b => b.type === 'tool_use');
    const textBlocks = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();

    if (data.stop_reason !== 'tool_use' || toolUses.length === 0) {
      return { text: textBlocks || "…", action: pendingAction };
    }

    messages.push({ role: 'assistant', content: data.content });
    const toolResults = [];
    for (const call of toolUses) {
      if (call.name === 'save_memory') {
        onToolEffect?.({ type: 'save_memory', input: call.input });
        toolResults.push({ type: 'tool_result', tool_use_id: call.id, content: 'Saved.' });
      } else if (call.name === 'apply_programming') {
        pendingAction = { label: call.input.button_label || 'Apply to my plan', plan: call.input.plan, rationale: call.input.rationale };
        toolResults.push({ type: 'tool_result', tool_use_id: call.id, content: 'Shown to user as a button; not yet applied.' });
      } else {
        toolResults.push({ type: 'tool_result', tool_use_id: call.id, content: 'Unknown tool.', is_error: true });
      }
    }
    messages.push({ role: 'user', content: toolResults });
  }
  return { text: "Lost track of that one — try asking again.", action: pendingAction };
}
