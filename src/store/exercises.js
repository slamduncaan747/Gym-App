// The exercise library and volume landmarks the program generator draws
// from. baseWeight is calibrated to a reference lifter (Bench 185 / Squat
// 245 / Deadlift 315 — see BASELINE_MAXES in seed.js) and scaled per-user by
// scaleFrom via state.scaleFactors, the same mechanism that already drives
// progressive overload (see derive.js#buildExerciseSet).
//
// Volume landmarks (MEV = minimum effective volume, MRV = maximum
// recoverable volume, in weekly hard sets) follow the commonly cited
// evidence-based ranges from the hypertrophy training literature (e.g.
// Renaissance Periodization's volume landmarks) — approximate guidance, not
// a substitute for individual response.
export const MUSCLES = ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Calves'];

export const VOLUME_TARGETS = [
  { muscle: 'Chest', mev: 8, mrv: 22 },
  { muscle: 'Back', mev: 10, mrv: 25 },
  { muscle: 'Shoulders', mev: 8, mrv: 26 },
  { muscle: 'Quads', mev: 8, mrv: 20 },
  { muscle: 'Hamstrings', mev: 6, mrv: 16 },
  { muscle: 'Glutes', mev: 4, mrv: 16 },
  { muscle: 'Biceps', mev: 6, mrv: 20 },
  { muscle: 'Triceps', mev: 6, mrv: 18 },
  { muscle: 'Calves', mev: 8, mrv: 20 }
];

// tier: 'compound' (heavy, low rep, drives the session) | 'accessory'
// (moderate) | 'isolation' (light, high rep). scaleFrom: which onboarding
// max this exercise's weight scales from ('chest'=Bench, 'legs'=Squat,
// 'back'=Deadlift), or null for equipment that doesn't scale meaningfully
// with barbell strength (bands, most cable/isolation work) — those still
// self-correct via the in-session and session-to-session auto-adjust.
export const EXERCISES = [
  // Chest
  { name: 'Bench press', muscle: 'Chest', equipment: 'barbell', tier: 'compound', scaleFrom: 'chest', baseWeight: 185, reps: [5, 7], tracksLift: 'Bench' },
  { name: 'Incline barbell press', muscle: 'Chest', equipment: 'barbell', tier: 'compound', scaleFrom: 'chest', baseWeight: 155, reps: [6, 8] },
  { name: 'Close-grip bench press', muscle: 'Chest', equipment: 'barbell', tier: 'compound', scaleFrom: 'chest', baseWeight: 165, reps: [6, 8] },
  { name: 'Flat dumbbell press', muscle: 'Chest', equipment: 'dumbbell', tier: 'accessory', scaleFrom: 'chest', baseWeight: 85, reps: [8, 10] },
  { name: 'Incline dumbbell press', muscle: 'Chest', equipment: 'dumbbell', tier: 'accessory', scaleFrom: 'chest', baseWeight: 70, reps: [8, 10] },
  { name: 'Machine chest press', muscle: 'Chest', equipment: 'machine', tier: 'accessory', scaleFrom: 'chest', baseWeight: 160, reps: [8, 10] },
  { name: 'Weighted dip', muscle: 'Chest', equipment: 'bodyweight', tier: 'accessory', scaleFrom: 'chest', baseWeight: 45, reps: [6, 8] },
  { name: 'Cable fly', muscle: 'Chest', equipment: 'cable', tier: 'isolation', scaleFrom: null, baseWeight: 25, reps: [12, 15] },
  { name: 'Machine fly', muscle: 'Chest', equipment: 'machine', tier: 'isolation', scaleFrom: null, baseWeight: 110, reps: [12, 15] },

  // Back
  { name: 'Deadlift', muscle: 'Back', equipment: 'barbell', tier: 'compound', scaleFrom: 'back', baseWeight: 315, reps: [3, 5], tracksLift: 'Deadlift' },
  { name: 'Barbell row', muscle: 'Back', equipment: 'barbell', tier: 'compound', scaleFrom: 'back', baseWeight: 155, reps: [6, 8] },
  { name: 'Weighted pull-up', muscle: 'Back', equipment: 'bodyweight', tier: 'compound', scaleFrom: 'back', baseWeight: 45, reps: [5, 7] },
  { name: 'Pull-up', muscle: 'Back', equipment: 'bodyweight', tier: 'accessory', scaleFrom: null, baseWeight: 0, reps: [6, 10] },
  { name: 'Chest-supported row', muscle: 'Back', equipment: 'machine', tier: 'accessory', scaleFrom: 'back', baseWeight: 160, reps: [8, 10] },
  { name: 'Lat pulldown', muscle: 'Back', equipment: 'cable', tier: 'accessory', scaleFrom: 'back', baseWeight: 140, reps: [8, 10] },
  { name: 'Seated cable row', muscle: 'Back', equipment: 'cable', tier: 'accessory', scaleFrom: 'back', baseWeight: 150, reps: [8, 10] },
  { name: 'Single-arm dumbbell row', muscle: 'Back', equipment: 'dumbbell', tier: 'accessory', scaleFrom: 'back', baseWeight: 70, reps: [8, 10] },

  // Shoulders
  { name: 'Overhead press', muscle: 'Shoulders', equipment: 'barbell', tier: 'compound', scaleFrom: 'chest', baseWeight: 115, reps: [5, 7] },
  { name: 'Push press', muscle: 'Shoulders', equipment: 'barbell', tier: 'compound', scaleFrom: 'chest', baseWeight: 135, reps: [4, 6] },
  { name: 'Seated dumbbell press', muscle: 'Shoulders', equipment: 'dumbbell', tier: 'accessory', scaleFrom: 'chest', baseWeight: 55, reps: [8, 10] },
  { name: 'Lateral raise', muscle: 'Shoulders', equipment: 'dumbbell', tier: 'isolation', scaleFrom: null, baseWeight: 20, reps: [12, 15] },
  { name: 'Cable lateral raise', muscle: 'Shoulders', equipment: 'cable', tier: 'isolation', scaleFrom: null, baseWeight: 15, reps: [12, 15] },
  { name: 'Face pull', muscle: 'Shoulders', equipment: 'cable', tier: 'isolation', scaleFrom: null, baseWeight: 40, reps: [15, 20] },
  { name: 'Band pull-apart', muscle: 'Shoulders', equipment: 'band', tier: 'isolation', scaleFrom: null, baseWeight: 0, reps: [20, 25] },

  // Quads
  { name: 'Back squat', muscle: 'Quads', equipment: 'barbell', tier: 'compound', scaleFrom: 'legs', baseWeight: 245, reps: [5, 7], tracksLift: 'Squat' },
  { name: 'Front squat', muscle: 'Quads', equipment: 'barbell', tier: 'compound', scaleFrom: 'legs', baseWeight: 205, reps: [5, 7] },
  { name: 'Leg press', muscle: 'Quads', equipment: 'machine', tier: 'compound', scaleFrom: 'legs', baseWeight: 405, reps: [8, 10] },
  { name: 'Bulgarian split squat', muscle: 'Quads', equipment: 'dumbbell', tier: 'accessory', scaleFrom: 'legs', baseWeight: 50, reps: [8, 10] },
  { name: 'Walking lunge', muscle: 'Quads', equipment: 'dumbbell', tier: 'accessory', scaleFrom: 'legs', baseWeight: 50, reps: [10, 12] },
  { name: 'Leg extension', muscle: 'Quads', equipment: 'machine', tier: 'isolation', scaleFrom: 'legs', baseWeight: 130, reps: [12, 15] },

  // Hamstrings
  { name: 'Romanian deadlift', muscle: 'Hamstrings', equipment: 'barbell', tier: 'compound', scaleFrom: 'back', baseWeight: 225, reps: [6, 8] },
  { name: 'Good morning', muscle: 'Hamstrings', equipment: 'barbell', tier: 'accessory', scaleFrom: 'back', baseWeight: 135, reps: [8, 10] },
  { name: 'Seated leg curl', muscle: 'Hamstrings', equipment: 'machine', tier: 'isolation', scaleFrom: 'legs', baseWeight: 90, reps: [12, 15] },
  { name: 'Lying leg curl', muscle: 'Hamstrings', equipment: 'machine', tier: 'isolation', scaleFrom: 'legs', baseWeight: 80, reps: [12, 15] },

  // Glutes
  { name: 'Hip thrust', muscle: 'Glutes', equipment: 'barbell', tier: 'compound', scaleFrom: 'legs', baseWeight: 225, reps: [8, 10] },
  { name: 'Cable pull-through', muscle: 'Glutes', equipment: 'cable', tier: 'accessory', scaleFrom: null, baseWeight: 60, reps: [12, 15] },

  // Biceps
  { name: 'Barbell curl', muscle: 'Biceps', equipment: 'barbell', tier: 'accessory', scaleFrom: 'back', baseWeight: 65, reps: [8, 10] },
  { name: 'Incline dumbbell curl', muscle: 'Biceps', equipment: 'dumbbell', tier: 'isolation', scaleFrom: null, baseWeight: 30, reps: [10, 12] },
  { name: 'Cable curl', muscle: 'Biceps', equipment: 'cable', tier: 'isolation', scaleFrom: null, baseWeight: 50, reps: [10, 12] },

  // Triceps
  { name: 'Triceps pushdown', muscle: 'Triceps', equipment: 'cable', tier: 'isolation', scaleFrom: null, baseWeight: 50, reps: [12, 15] },
  { name: 'Skull crusher', muscle: 'Triceps', equipment: 'barbell', tier: 'isolation', scaleFrom: 'chest', baseWeight: 65, reps: [10, 12] },
  { name: 'Overhead triceps extension', muscle: 'Triceps', equipment: 'dumbbell', tier: 'isolation', scaleFrom: null, baseWeight: 35, reps: [10, 12] },

  // Calves
  { name: 'Standing calf raise', muscle: 'Calves', equipment: 'machine', tier: 'isolation', scaleFrom: 'legs', baseWeight: 180, reps: [12, 15] },
  { name: 'Seated calf raise', muscle: 'Calves', equipment: 'machine', tier: 'isolation', scaleFrom: 'legs', baseWeight: 110, reps: [12, 15] }
];

export const EXERCISES_BY_NAME = Object.fromEntries(EXERCISES.map(e => [e.name, e]));

export const EASY_CARDIO = { name: 'Easy bike', muscle: null, equipment: 'machine', tier: 'conditioning', target: 'conditioning', range: '8 min', sets: [{ w: 0, r: 8 }] };

// Weekly split blueprints, keyed by training-day count. Each day lists its
// target muscles with a role: 'primary' gets a compound + accessory work
// and the larger volume share, 'secondary' gets one lighter accessory.
export const SPLIT_TEMPLATES = {
  1: [
    { title: 'Full body', targets: [{ m: 'Chest', r: 'primary' }, { m: 'Back', r: 'primary' }, { m: 'Quads', r: 'primary' }, { m: 'Shoulders', r: 'secondary' }, { m: 'Hamstrings', r: 'secondary' }] }
  ],
  2: [
    { title: 'Full body A', targets: [{ m: 'Chest', r: 'primary' }, { m: 'Back', r: 'primary' }, { m: 'Quads', r: 'secondary' }, { m: 'Shoulders', r: 'secondary' }] },
    { title: 'Full body B', targets: [{ m: 'Quads', r: 'primary' }, { m: 'Hamstrings', r: 'primary' }, { m: 'Back', r: 'secondary' }, { m: 'Chest', r: 'secondary' }, { m: 'Glutes', r: 'secondary' }] }
  ],
  3: [
    { title: 'Push', targets: [{ m: 'Chest', r: 'primary' }, { m: 'Shoulders', r: 'primary' }, { m: 'Triceps', r: 'secondary' }] },
    { title: 'Pull', targets: [{ m: 'Back', r: 'primary' }, { m: 'Biceps', r: 'secondary' }, { m: 'Shoulders', r: 'secondary' }] },
    { title: 'Legs', targets: [{ m: 'Quads', r: 'primary' }, { m: 'Hamstrings', r: 'primary' }, { m: 'Glutes', r: 'secondary' }, { m: 'Calves', r: 'secondary' }] }
  ],
  4: [
    { title: 'Upper A', targets: [{ m: 'Chest', r: 'primary' }, { m: 'Back', r: 'primary' }, { m: 'Shoulders', r: 'secondary' }, { m: 'Triceps', r: 'secondary' }, { m: 'Biceps', r: 'secondary' }] },
    { title: 'Lower A', targets: [{ m: 'Quads', r: 'primary' }, { m: 'Hamstrings', r: 'secondary' }, { m: 'Glutes', r: 'secondary' }, { m: 'Calves', r: 'secondary' }] },
    { title: 'Upper B', targets: [{ m: 'Back', r: 'primary' }, { m: 'Chest', r: 'primary' }, { m: 'Shoulders', r: 'primary' }, { m: 'Triceps', r: 'secondary' }] },
    { title: 'Lower B', targets: [{ m: 'Hamstrings', r: 'primary' }, { m: 'Quads', r: 'secondary' }, { m: 'Glutes', r: 'primary' }, { m: 'Calves', r: 'secondary' }] }
  ],
  5: [
    { title: 'Push', targets: [{ m: 'Chest', r: 'primary' }, { m: 'Shoulders', r: 'primary' }, { m: 'Triceps', r: 'secondary' }] },
    { title: 'Pull', targets: [{ m: 'Back', r: 'primary' }, { m: 'Biceps', r: 'secondary' }] },
    { title: 'Legs', targets: [{ m: 'Quads', r: 'primary' }, { m: 'Hamstrings', r: 'primary' }, { m: 'Calves', r: 'secondary' }] },
    { title: 'Upper', targets: [{ m: 'Chest', r: 'secondary' }, { m: 'Back', r: 'secondary' }, { m: 'Shoulders', r: 'primary' }] },
    { title: 'Lower', targets: [{ m: 'Hamstrings', r: 'secondary' }, { m: 'Glutes', r: 'primary' }, { m: 'Quads', r: 'secondary' }] }
  ],
  6: [
    { title: 'Push', targets: [{ m: 'Chest', r: 'primary' }, { m: 'Shoulders', r: 'secondary' }, { m: 'Triceps', r: 'secondary' }] },
    { title: 'Pull', targets: [{ m: 'Back', r: 'primary' }, { m: 'Biceps', r: 'secondary' }] },
    { title: 'Legs', targets: [{ m: 'Quads', r: 'primary' }, { m: 'Hamstrings', r: 'secondary' }, { m: 'Calves', r: 'secondary' }] },
    { title: 'Push', targets: [{ m: 'Shoulders', r: 'primary' }, { m: 'Chest', r: 'secondary' }, { m: 'Triceps', r: 'secondary' }] },
    { title: 'Pull', targets: [{ m: 'Back', r: 'primary' }, { m: 'Biceps', r: 'secondary' } ] },
    { title: 'Legs', targets: [{ m: 'Hamstrings', r: 'primary' }, { m: 'Quads', r: 'secondary' }, { m: 'Glutes', r: 'secondary' }] }
  ]
};

export const PIVOTS = [
  { k: 'short', label: '30 minutes' },
  { k: 'nobar', label: 'No barbells' },
  { k: 'chest', label: 'Chest focus' },
  { k: 'back', label: 'Back focus' },
  { k: 'legs', label: 'Legs focus' },
  { k: 'sore', label: 'Sore' }
];
