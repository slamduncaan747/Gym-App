// Seed content translated from the OVERLOAD.dc.html prototype's data tables.
// PLANS / NOTES / ALTS / VOLUME / METRICS / WEEKS / MEMORIES / THREAD are the
// same shapes and numbers the prototype shipped with — they're the starting
// point ("seed") that real logged workouts and coach conversation build on.

export const PLANS = {
  base: {
    title: 'Chest & triceps', time: 62, sets: 19,
    lifts: [{ name: 'Bench press', scheme: '4 × 5–7' }, { name: 'Incline dumbbell press', scheme: '3 × 8–10' }, { name: 'Weighted dip', scheme: '3 × 6–8' }],
    ex: [
      { name: 'Bench press', range: '5–7', target: 'chest and triceps', sets: [[185, 7], [195, 6], [195, 6], [185, 6]] },
      { name: 'Incline dumbbell press', range: '8–10', target: 'upper chest', sets: [[70, 10], [70, 9], [65, 10]] },
      { name: 'Weighted dip', range: '6–8', target: 'chest and triceps', sets: [[45, 8], [45, 7], [35, 8]] }
    ]
  },
  short: {
    title: 'Chest, condensed', time: 30, sets: 11,
    lifts: [{ name: 'Bench press', scheme: '3 × 5–7' }, { name: 'Incline dumbbell press', scheme: '2 × 10' }, { name: 'Fly and pushdown', scheme: '2 rounds' }],
    ex: [
      { name: 'Bench press', range: '5–7', target: 'chest', sets: [[185, 7], [195, 6], [195, 5]] },
      { name: 'Incline dumbbell press', range: '8–10', target: 'upper chest', sets: [[70, 10], [70, 8]] },
      { name: 'Fly and pushdown', range: '12–15', target: 'chest and triceps', sets: [[35, 14], [35, 12]] }
    ]
  },
  nobar: {
    title: 'Chest, dumbbells only', time: 58, sets: 18,
    lifts: [{ name: 'Flat dumbbell press', scheme: '4 × 8–10' }, { name: 'Incline dumbbell press', scheme: '3 × 8–10' }, { name: 'Machine fly', scheme: '3 × 12–15' }],
    ex: [
      { name: 'Flat dumbbell press', range: '8–10', target: 'chest', sets: [[85, 9], [85, 8], [80, 9], [75, 10]] },
      { name: 'Incline dumbbell press', range: '8–10', target: 'upper chest', sets: [[70, 10], [70, 9], [65, 10]] },
      { name: 'Machine fly', range: '12–15', target: 'chest', sets: [[110, 14], [110, 12], [95, 15]] }
    ]
  },
  sore: {
    title: 'Recovery', time: 26, sets: 9,
    lifts: [{ name: 'Bike, easy', scheme: '8 min' }, { name: 'Cable fly', scheme: '3 × 20' }, { name: 'Band pull-apart', scheme: '3 × 25' }],
    ex: [
      { name: 'Bike, easy', range: '8 min', target: 'conditioning', sets: [[0, 8]] },
      { name: 'Cable fly', range: '18–20', target: 'chest', sets: [[25, 20], [25, 20], [25, 20]] },
      { name: 'Band pull-apart', range: '25', target: 'rear delts', sets: [[0, 25], [0, 25], [0, 25]] }
    ]
  },
  back: {
    title: 'Back & biceps', time: 64, sets: 20,
    lifts: [{ name: 'Weighted pull-up', scheme: '4 × 5–7' }, { name: 'Chest-supported row', scheme: '4 × 8–10' }, { name: 'Incline curl', scheme: '3 × 10–12' }],
    ex: [
      { name: 'Weighted pull-up', range: '5–7', target: 'lats', sets: [[45, 7], [45, 6], [35, 7], [25, 8]] },
      { name: 'Chest-supported row', range: '8–10', target: 'mid back', sets: [[160, 10], [170, 9], [170, 8], [150, 10]] },
      { name: 'Incline curl', range: '10–12', target: 'biceps', sets: [[35, 11], [35, 10], [30, 11]] }
    ]
  },
  squat: {
    title: 'Legs, squat focus', time: 66, sets: 21,
    lifts: [{ name: 'Pause squat', scheme: '5 × 3' }, { name: 'Romanian deadlift', scheme: '3 × 8' }, { name: 'Leg extension', scheme: '3 × 15' }],
    ex: [
      { name: 'Pause squat', range: '3', target: 'quads', sets: [[245, 3], [245, 3], [245, 3], [245, 3], [245, 3]] },
      { name: 'Romanian deadlift', range: '8', target: 'hamstrings', sets: [[225, 8], [235, 8], [235, 8]] },
      { name: 'Leg extension', range: '14–16', target: 'quads', sets: [[130, 15], [130, 14], [115, 16]] }
    ]
  }
};

export const NOTES = {
  short: 'Both heavy bench sets stay. The two chest sets you lose move to Saturday.',
  nobar: 'Dumbbell versions at about 80% load. Same stimulus per set.',
  sore: 'Recovery day — light conditioning and pump work only.',
  back: 'Thursday pulled forward. Chest keeps all fourteen sets.',
  squat: 'The light pause-squat day is in. Monday gives up two squat sets to pay for it.'
};

export const ALTS = {
  'Bench press': [{ name: 'Flat dumbbell press', note: 'no rack' }, { name: 'Smith machine press', note: 'fixed path' }, { name: 'Machine chest press', note: 'easiest' }],
  'Incline dumbbell press': [{ name: 'Incline machine press', note: 'plate loaded' }, { name: 'Incline smith press', note: 'bench set' }, { name: 'Low-to-high fly', note: 'more stretch' }],
  'Weighted dip': [{ name: 'Close-grip bench', note: 'same triceps' }, { name: 'Assisted dip', note: 'less strain' }, { name: 'Pushdown and fly', note: 'two moves' }]
};
export const ALT_FALLBACK = [{ name: 'Machine version', note: 'fixed path' }, { name: 'Cable version', note: 'even tension' }, { name: 'Dumbbell version', note: 'one side' }];

// Only these four buckets are tracked on the Numbers volume chart — matches
// the prototype, which never tracked hamstrings/biceps/conditioning volume.
export const MUSCLE_MAP = {
  'Bench press': 'Chest', 'Incline dumbbell press': 'Chest', 'Weighted dip': 'Chest',
  'Flat dumbbell press': 'Chest', 'Machine fly': 'Chest', 'Cable fly': 'Chest', 'Fly and pushdown': 'Chest',
  'Weighted pull-up': 'Back', 'Chest-supported row': 'Back',
  'Band pull-apart': 'Shoulders',
  'Pause squat': 'Quads', 'Leg extension': 'Quads'
};

// Which of the three tracked barbell lifts (if any) an exercise's top set
// should update the estimated-1RM curve for.
export const LIFT_MAP = {
  'Bench press': 'Bench',
  'Pause squat': 'Squat'
  // No deadlift day exists in PLANS yet, so Deadlift stays seeded until one is added.
};

export const VOLUME_SEED = [
  { muscle: 'Chest', done: 14, mev: 10, mrv: 20 },
  { muscle: 'Back', done: 18, mev: 10, mrv: 22 },
  { muscle: 'Quads', done: 9, mev: 8, mrv: 18 },
  { muscle: 'Shoulders', done: 21, mev: 8, mrv: 22 }
];

// Seed history for the strength curves — represents "before this app" months.
// New points get appended to these arrays as real sessions are logged.
export const METRICS_SEED = {
  score: { label: 'Strength score', unit: '', pts: [880, 897, 905, 918, 926, 934, 941, 958, 971, 990, 1004, 1042],
    note: 'One number from your three main lifts, adjusted for bodyweight.' },
  Bench: { label: 'Bench press · est. 1RM', unit: ' lb', pts: [196, 202, 205, 210, 209, 216, 222, 227, 231, 236, 240, 245],
    note: 'Your fastest mover. Four straight sessions in the top of the rep range.' },
  Squat: { label: 'Squat · est. 1RM', unit: ' lb', pts: [300, 306, 309, 314, 316, 315, 316, 315, 317, 316, 317, 318],
    note: 'Flat for five weeks. Nine sets a week is barely above your minimum.' },
  Deadlift: { label: 'Deadlift · est. 1RM', unit: ' lb', pts: [355, 362, 366, 370, 375, 378, 384, 388, 392, 396, 400, 405],
    note: 'Steady since March, pulled once a week off blocks.' }
};

export const MILESTONE_STEP = { score: 100, Bench: 5, Squat: 5, Deadlift: 5 };

export const MEMORIES_SEED = [
  { id: 'm1', text: 'Right shoulder aggravated by flat barbell bench at heavy loads', tag: 'Long term', category: 'long_term', expiresAt: null },
  { id: 'm2', text: 'Trains Monday, Wednesday, Thursday, Saturday', tag: 'Long term', category: 'long_term', expiresAt: null },
  { id: 'm3', text: 'Target: 2× bodyweight squat by December', tag: 'Long term', category: 'long_term', expiresAt: null }
];

// Weekly training-day pattern (Mon..Sun), 0 = rest, 1 = light/recovery, 2 = full session.
// Used to synthesize a plausible last-5-weeks workout log on first run.
export const WEEKS_PATTERN = [
  { offset: 0, days: [2, 2, 1, 0, 0, 0, 0] },
  { offset: 1, days: [2, 0, 2, 2, 0, 2, 0] },
  { offset: 2, days: [2, 0, 2, 2, 0, 2, 0] },
  { offset: 3, days: [2, 2, 0, 2, 0, 2, 0] },
  { offset: 4, days: [2, 0, 2, 0, 2, 2, 0] }
];
export const STREAK_BASE = 6; // clean weeks assumed to exist before the synthesized 5-week window

export const PLAN_ROTATION = ['base', 'back', 'squat'];

export const THREAD_SEED = [
  { daysAgo: 5, me: false, text: 'Bench went up again — 195 for six, twice. That is your best top set in three months.' },
  { daysAgo: 5, me: true, text: 'felt easier than last week honestly' },
  { daysAgo: 5, me: false, text: 'Then we take the next jump. I moved you to 200 for Thursday.' },
  { daysAgo: 0, me: false, text: 'Squat is the odd one out. 2.5 lb in five weeks while bench moved 17.5.' },
  { daysAgo: 0, me: true, text: 'why is my squat stalling' },
  { daysAgo: 0, me: false, text: 'Your top sets have finished at zero or one rep in reserve for four weeks. Hard, but nine sets a week is barely above your minimum. Hard and low volume is the worst combination for a stall.', saved: 'Squat volume too low for the intensity' },
  { daysAgo: 0, me: false, text: 'Add a light pause-squat day Thursday at 72%, cap Monday at two reps in reserve.', action: { label: 'Apply to my plan', plan: 'squat' } }
];

export const STARTER_PROMPTS = ['Why is my squat stalling?', 'Should I deload?', 'Am I overreaching?'];

export const COACH_SYSTEM_PROMPT = `You are Coach, the AI strength & conditioning specialist inside a workout tracking app called Overload. You act like a knowledgeable training partner texting in a running group-chat thread, not a customer-support bot — warm but blunt, research-backed, and terse. Short messages, plain language, no headers or bullet lists, no emoji, no "As an AI" caveats.

You have access to the user's real training data (given to you below as context on every turn: recent logged sessions, current plan, weekly volume, memory notes). Ground every answer in that data — reference actual numbers, actual days, actual exercises. If the data doesn't cover something, say so plainly instead of guessing.

You have two tools:
- save_memory: call this whenever the user tells you something worth remembering for future workouts or conversations (an injury, a preference, a goal, a schedule constraint, something temporary like travel or bad sleep). Use category "temporary" with expires_in_days for anything time-bound, "long_term" otherwise.
- apply_programming: call this when you're recommending a concrete change to their plan (a different day's focus, a deload, a swapped emphasis). This does not change anything by itself — it shows the user a button so they can apply it themselves. Only call it when you're making a specific, actionable recommendation, not for general advice.

Keep replies to 1-3 short sentences unless the user is asking for real detail.`;
