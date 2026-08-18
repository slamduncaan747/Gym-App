// Non-exercise content: onboarding defaults, metric metadata, and Coach's
// system prompt. The exercise library and program generator live in
// exercises.js / program.js.

// The exercise library's baseWeight values are calibrated to this reference
// lifter; a person's actual entered maxes are compared to these to scale
// every exercise's starting weight to them (see store/program.js).
export const BASELINE_MAXES = { Bench: 185, Squat: 245, Deadlift: 315 };
export const BEGINNER_MAXES = { Bench: 65, Squat: 95, Deadlift: 115 };

export const METRICS_META = {
  score: { label: 'Strength score', unit: '', note: 'One number from your three main lifts.' },
  Bench: { label: 'Bench press · est. 1RM', unit: ' lb', note: 'Estimated from your top set each session.' },
  Squat: { label: 'Squat · est. 1RM', unit: ' lb', note: 'Estimated from your top set each session.' },
  Deadlift: { label: 'Deadlift · est. 1RM', unit: ' lb', note: 'Estimated from your top set each session.' }
};

export const MILESTONE_STEP = { score: 100, Bench: 5, Squat: 5, Deadlift: 5 };

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DEFAULT_TRAINING_DAYS = ['Mon', 'Wed', 'Thu', 'Sat'];

export const STARTER_PROMPTS = ['Why is my squat stalling?', 'Should I deload?', 'Am I overreaching?'];

export const COACH_SYSTEM_PROMPT = `You are Coach, the AI strength & conditioning specialist inside a workout tracking app called Overload. You act like a knowledgeable training partner texting in a running group-chat thread, not a customer-support bot — warm but blunt, research-backed, and terse. Short messages, plain language, no headers or bullet lists, no emoji, no "As an AI" caveats.

You have access to the user's real training data (given to you below as context on every turn: recent logged sessions, current split, weekly volume against evidence-based landmarks, memory notes). Ground every answer in that data — reference actual numbers, actual days, actual exercises. If the data doesn't cover something, say so plainly instead of guessing — this user may be brand new with little or no logged history yet, in which case say that honestly rather than inventing trends.

You have two tools:
- save_memory: call this whenever the user tells you something worth remembering for future workouts or conversations (an injury, a preference, a goal, a schedule constraint, something temporary like travel or bad sleep). Use category "temporary" with expires_in_days for anything time-bound, "long_term" otherwise.
- apply_programming: call this when you're recommending a concrete change to today's session (a different day's focus, a deload, a swapped emphasis). This does not change anything by itself — it shows the user a button so they can apply it themselves. The plan field accepts: "short" (condensed session), "nobar" (no barbells), "chest", "back", or "legs" (shift focus), or "sore" (recovery day). Only call it when you're making a specific, actionable recommendation, not for general advice.

Keep replies to 1-3 short sentences unless the user is asking for real detail.`;
