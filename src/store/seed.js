// Content translated from the OVERLOAD.dc.html prototype's data tables.
// PLANS / NOTES / ALTS / MUSCLE_MAP describe the training content itself and
// are used as-is. The prototype's fixed demo numbers (a fake 12-month
// history, a fake 5-week log, canned chat, canned memories) are NOT used —
// those only existed to make static mockup screens look populated. The real
// app seeds all of that from onboarding instead, so day one reflects the
// person actually using it.

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

// PLANS weights above are tuned to this reference lifter. A person's actual
// entered maxes are compared to these to scale every exercise's starting
// weight to them (see store/derive.js#scaleFactorsFromMaxes).
export const BASELINE_MAXES = { Bench: 185, Squat: 245, Deadlift: 315 };
export const BEGINNER_MAXES = { Bench: 65, Squat: 95, Deadlift: 115 };

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

// Which category of BASELINE_MAXES scales an exercise's starting weight.
export const SCALE_CATEGORY = { Chest: 'chest', Quads: 'legs', Back: 'back', Shoulders: 'back' };

// Which of the three tracked barbell lifts (if any) an exercise's top set
// should update the estimated-1RM curve for.
export const LIFT_MAP = {
  'Bench press': 'Bench',
  'Pause squat': 'Squat'
  // No deadlift day exists in PLANS yet, so Deadlift only moves once one is added.
};

export const VOLUME_TARGETS = [
  { muscle: 'Chest', mev: 10, mrv: 20 },
  { muscle: 'Back', mev: 10, mrv: 22 },
  { muscle: 'Quads', mev: 8, mrv: 18 },
  { muscle: 'Shoulders', mev: 8, mrv: 22 }
];

export const METRICS_META = {
  score: { label: 'Strength score', unit: '', note: 'One number from your three main lifts.' },
  Bench: { label: 'Bench press · est. 1RM', unit: ' lb', note: 'Estimated from your top set each session.' },
  Squat: { label: 'Squat · est. 1RM', unit: ' lb', note: 'Estimated from your top set each session.' },
  Deadlift: { label: 'Deadlift · est. 1RM', unit: ' lb', note: 'No deadlift session logged yet.' }
};

export const MILESTONE_STEP = { score: 100, Bench: 5, Squat: 5, Deadlift: 5 };

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DEFAULT_TRAINING_DAYS = ['Mon', 'Wed', 'Thu', 'Sat'];

export const STARTER_PROMPTS = ['Why is my squat stalling?', 'Should I deload?', 'Am I overreaching?'];

export const COACH_SYSTEM_PROMPT = `You are Coach, the AI strength & conditioning specialist inside a workout tracking app called Overload. You act like a knowledgeable training partner texting in a running group-chat thread, not a customer-support bot — warm but blunt, research-backed, and terse. Short messages, plain language, no headers or bullet lists, no emoji, no "As an AI" caveats.

You have access to the user's real training data (given to you below as context on every turn: recent logged sessions, current plan, weekly volume, memory notes). Ground every answer in that data — reference actual numbers, actual days, actual exercises. If the data doesn't cover something, say so plainly instead of guessing — this user may be brand new with little or no logged history yet, in which case say that honestly rather than inventing trends.

You have two tools:
- save_memory: call this whenever the user tells you something worth remembering for future workouts or conversations (an injury, a preference, a goal, a schedule constraint, something temporary like travel or bad sleep). Use category "temporary" with expires_in_days for anything time-bound, "long_term" otherwise.
- apply_programming: call this when you're recommending a concrete change to their plan (a different day's focus, a deload, a swapped emphasis). This does not change anything by itself — it shows the user a button so they can apply it themselves. Only call it when you're making a specific, actionable recommendation, not for general advice.

Keep replies to 1-3 short sentences unless the user is asking for real detail.`;
