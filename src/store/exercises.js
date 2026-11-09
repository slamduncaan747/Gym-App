// The exercise library, volume landmarks, and split blueprints the program
// generator draws from.
//
// `base` is the working weight a reference lifter (est. 1RM: bench 240,
// squat 320, deadlift 390 lb — REF_1RM below) would use at the top of the
// exercise's rep range with about two reps in reserve. Dumbbell loads are
// per hand, cable loads per side. A person's own starting weight scales
// from that by their max on the exercise's `ref` lift; after the first
// logged session the generator stops estimating and progresses from what
// was actually lifted (see program.js#prescribe).
//
// Volume landmarks (MEV = minimum effective volume, MRV = maximum
// recoverable volume, in weekly hard sets) follow the commonly cited ranges
// from the hypertrophy literature (Renaissance Periodization-style
// guidance) — approximate defaults, not a substitute for individual
// response.
export const MUSCLES = ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Calves', 'Core'];

export const VOLUME_TARGETS = [
  { muscle: 'Chest', mev: 8, mrv: 22 },
  { muscle: 'Back', mev: 10, mrv: 25 },
  { muscle: 'Shoulders', mev: 8, mrv: 26 },
  { muscle: 'Quads', mev: 8, mrv: 20 },
  { muscle: 'Hamstrings', mev: 6, mrv: 16 },
  { muscle: 'Glutes', mev: 4, mrv: 16 },
  { muscle: 'Biceps', mev: 6, mrv: 20 },
  { muscle: 'Triceps', mev: 6, mrv: 18 },
  { muscle: 'Calves', mev: 6, mrv: 20 },
  { muscle: 'Core', mev: 4, mrv: 20 }
];
export const LANDMARK = Object.fromEntries(VOLUME_TARGETS.map(v => [v.muscle, v]));

export const REF_1RM = { Bench: 240, Squat: 320, Deadlift: 390 };

// tier: 'compound' (heavy, drives the session) | 'accessory' (moderate) |
// 'isolation' (light, higher rep).
// equipment: barbell | dumbbell | machine | cable | bodyweight | weighted
// (bodyweight plus added load) | band.
// opts: tracksLift — feeds the Bench/Squat/Deadlift strength curves;
//       unit 'sec' | 'min' — timed work, `reps` is then a duration range;
//       single — one dumbbell total, not one per hand;
//       each — performed one side at a time;
//       basic — a no-equipment fallback the generator only reaches for
//       when the person's equipment leaves nothing better.
function x(name, muscle, secondary, equipment, tier, ref, base, reps, cues, opts) {
  return { name, muscle, secondary, equipment, tier, ref, base, reps, cues, unit: 'reps', ...opts };
}

export const EXERCISES = [
  // ── Chest ────────────────────────────────────────────────────────────
  x('Bench press', 'Chest', ['Triceps', 'Shoulders'], 'barbell', 'compound', 'Bench', 180, [5, 8],
    ['Shoulder blades pinned back and down', 'Lower to mid-chest, forearms vertical', 'Feet planted — drive the floor away'], { tracksLift: 'Bench' }),
  x('Incline barbell press', 'Chest', ['Shoulders', 'Triceps'], 'barbell', 'compound', 'Bench', 145, [6, 9],
    ['Bench at 30–45°', 'Bar to upper chest, elbows about 60° out', 'Keep the shoulder blades tucked at the top']),
  x('Flat dumbbell press', 'Chest', ['Triceps', 'Shoulders'], 'dumbbell', 'accessory', 'Bench', 70, [8, 12],
    ['Deep stretch at the bottom', 'Press up and slightly in', 'Wrists stacked over elbows']),
  x('Incline dumbbell press', 'Chest', ['Shoulders', 'Triceps'], 'dumbbell', 'accessory', 'Bench', 60, [8, 12],
    ['Bench at about 30°', 'Elbows under the wrists all the way', 'Control the way down']),
  x('Machine chest press', 'Chest', ['Triceps', 'Shoulders'], 'machine', 'accessory', 'Bench', 155, [8, 12],
    ['Handles level with mid-chest', 'Shoulder blades back against the pad', 'Stop just short of lockout']),
  x('Weighted dip', 'Chest', ['Triceps', 'Shoulders'], 'weighted', 'accessory', 'Bench', 25, [6, 10],
    ['Lean the torso forward', 'Lower until shoulders dip below elbows', 'Drive up without shrugging']),
  x('Cable fly', 'Chest', [], 'cable', 'isolation', 'Bench', 25, [12, 15],
    ['Slight bend in the elbows, held fixed', 'Hug a wide arc', 'Squeeze for a beat at the middle']),
  x('Machine fly', 'Chest', [], 'machine', 'isolation', 'Bench', 100, [12, 15],
    ['Seat so the handles sit at chest height', 'Lead with the elbows', 'Slow stretch on the way back']),
  x('Dumbbell fly', 'Chest', [], 'dumbbell', 'isolation', 'Bench', 30, [10, 15],
    ['Soft elbows, wide arc', 'Lower until the chest is fully stretched', 'Stop before the dumbbells touch']),
  x('Low-to-high cable fly', 'Chest', ['Shoulders'], 'cable', 'isolation', 'Bench', 20, [12, 15],
    ['Pulleys set low', 'Scoop up and in to chin height', 'Keep the ribs down']),
  x('Push-up', 'Chest', ['Triceps', 'Shoulders'], 'bodyweight', 'accessory', null, 0, [8, 20],
    ['Body in one straight line', 'Chest to the floor, elbows about 45°', 'Push the ground away at the top'], { basic: true }),
  x('Decline push-up', 'Chest', ['Shoulders', 'Triceps'], 'bodyweight', 'accessory', null, 0, [8, 15],
    ['Feet up on a bench or step', 'Hands just outside shoulder width', 'Brace so the hips do not sag'], { basic: true }),
  x('Dip', 'Chest', ['Triceps', 'Shoulders'], 'bodyweight', 'accessory', null, 0, [6, 12],
    ['Lean forward for chest', 'Shoulders below elbows at the bottom', 'Full lockout at the top'], { basic: true }),

  // ── Back ─────────────────────────────────────────────────────────────
  x('Deadlift', 'Back', ['Hamstrings', 'Glutes'], 'barbell', 'compound', 'Deadlift', 315, [3, 5],
    ['Bar over mid-foot, shins to the bar', 'Pull the slack out, lats tight', 'Push the floor away — hips and shoulders rise together'], { tracksLift: 'Deadlift' }),
  x('Barbell row', 'Back', ['Biceps'], 'barbell', 'compound', 'Deadlift', 155, [6, 10],
    ['Hinge to about 45°, back flat', 'Pull to the lower ribs', 'No heaving with the hips']),
  x('Weighted pull-up', 'Back', ['Biceps'], 'weighted', 'compound', 'Deadlift', 25, [5, 8],
    ['Start from a dead hang', 'Drive the elbows down to the hips', 'Chin clearly over the bar']),
  x('T-bar row', 'Back', ['Biceps'], 'barbell', 'compound', 'Deadlift', 135, [6, 10],
    ['Chest up, hinge held still', 'Pull the handle to the sternum', 'Pause at the top']),
  x('Pull-up', 'Back', ['Biceps'], 'bodyweight', 'compound', null, 0, [5, 10],
    ['Full hang at the bottom', 'Pull the chest to the bar', 'No kipping — control down']),
  x('Chin-up', 'Back', ['Biceps'], 'bodyweight', 'compound', null, 0, [5, 10],
    ['Palms facing you, shoulder width', 'Lead with the chest', 'Lower all the way out']),
  x('Lat pulldown', 'Back', ['Biceps'], 'cable', 'accessory', 'Deadlift', 140, [8, 12],
    ['Slight lean back, chest tall', 'Pull the bar to the collarbone', 'Let the lats stretch fully up top']),
  x('Seated cable row', 'Back', ['Biceps'], 'cable', 'accessory', 'Deadlift', 140, [8, 12],
    ['Tall torso, no rocking', 'Pull to the navel', 'Squeeze the shoulder blades together']),
  x('Chest-supported row', 'Back', ['Biceps'], 'machine', 'accessory', 'Deadlift', 135, [8, 12],
    ['Chest stays glued to the pad', 'Drive the elbows back', 'One-second squeeze']),
  x('Single-arm dumbbell row', 'Back', ['Biceps'], 'dumbbell', 'accessory', 'Deadlift', 70, [8, 12],
    ['Hand and knee on the bench, back flat', 'Pull to the hip, not the shoulder', 'Full stretch at the bottom'], { each: true }),
  x('Chest-supported dumbbell row', 'Back', ['Biceps'], 'dumbbell', 'accessory', 'Deadlift', 55, [8, 12],
    ['Lie chest-down on an incline bench', 'Row both dumbbells to the hips', 'Do not lift the chest off the pad']),
  x('Straight-arm pulldown', 'Back', [], 'cable', 'isolation', 'Deadlift', 50, [12, 15],
    ['Arms nearly straight throughout', 'Sweep the bar to the thighs', 'Feel the lats, not the triceps']),
  x('Dumbbell pullover', 'Back', ['Chest'], 'dumbbell', 'isolation', 'Deadlift', 45, [10, 15],
    ['Shoulders across the bench', 'Lower behind the head with soft elbows', 'Pull back over the chest with the lats'], { single: true }),
  x('Inverted row', 'Back', ['Biceps'], 'bodyweight', 'accessory', null, 0, [8, 15],
    ['Body rigid, heels on the floor', 'Pull the chest to the bar', 'Lower the feet angle to make it harder'], { basic: true }),

  // ── Shoulders ────────────────────────────────────────────────────────
  x('Overhead press', 'Shoulders', ['Triceps'], 'barbell', 'compound', 'Bench', 110, [5, 8],
    ['Glutes and abs tight', 'Bar travels straight — head moves out of the way', 'Finish with the bar over mid-foot']),
  x('Push press', 'Shoulders', ['Triceps', 'Quads'], 'barbell', 'compound', 'Bench', 140, [4, 6],
    ['Short, vertical dip', 'Drive hard with the legs', 'Lock out and control the descent']),
  x('Seated dumbbell press', 'Shoulders', ['Triceps'], 'dumbbell', 'accessory', 'Bench', 50, [8, 12],
    ['Back supported, ribs down', 'Lower to ear height', 'Press up without clanging the dumbbells']),
  x('Arnold press', 'Shoulders', ['Triceps'], 'dumbbell', 'accessory', 'Bench', 40, [8, 12],
    ['Start with palms facing you', 'Rotate out as you press', 'Reverse the path on the way down']),
  x('Machine shoulder press', 'Shoulders', ['Triceps'], 'machine', 'accessory', 'Bench', 110, [8, 12],
    ['Handles start at ear height', 'Back flat against the pad', 'Smooth, no bouncing at the bottom']),
  x('Lateral raise', 'Shoulders', [], 'dumbbell', 'isolation', 'Bench', 15, [12, 20],
    ['Lead with the elbows', 'Raise to shoulder height, no higher', 'Lower slower than you lift']),
  x('Cable lateral raise', 'Shoulders', [], 'cable', 'isolation', 'Bench', 10, [12, 20],
    ['Cable crosses in front of the body', 'Lift out to the side, pinky slightly up', 'Keep tension at the bottom'], { each: true }),
  x('Face pull', 'Shoulders', ['Back'], 'cable', 'isolation', 'Bench', 40, [15, 20],
    ['Rope at face height', 'Pull toward the eyes, elbows high', 'Finish with the hands apart']),
  x('Reverse pec deck', 'Shoulders', ['Back'], 'machine', 'isolation', 'Bench', 70, [12, 20],
    ['Chest against the pad', 'Sweep the arms out and back', 'No shrugging']),
  x('Rear delt fly', 'Shoulders', ['Back'], 'dumbbell', 'isolation', 'Bench', 15, [12, 20],
    ['Hinge until the torso is near parallel', 'Raise out to the sides, soft elbows', 'Pause at the top']),
  x('Band pull-apart', 'Shoulders', ['Back'], 'band', 'isolation', null, 0, [15, 25],
    ['Arms straight at shoulder height', 'Pull the band to the chest', 'Squeeze the shoulder blades']),
  x('Pike push-up', 'Shoulders', ['Triceps'], 'bodyweight', 'accessory', null, 0, [6, 12],
    ['Hips high, body in an inverted V', 'Lower the head between the hands', 'Elevate the feet to make it harder'], { basic: true }),
  x('Prone Y raise', 'Shoulders', ['Back'], 'bodyweight', 'isolation', null, 0, [12, 20],
    ['Lie face down, arms in a Y', 'Lift the arms with thumbs up', 'Hold the top for a beat'], { basic: true }),

  // ── Quads ────────────────────────────────────────────────────────────
  x('Back squat', 'Quads', ['Glutes', 'Hamstrings'], 'barbell', 'compound', 'Squat', 240, [5, 8],
    ['Big breath and brace before each rep', 'Knees track over the toes', 'Hip crease below the knee, then drive up'], { tracksLift: 'Squat' }),
  x('Front squat', 'Quads', ['Glutes', 'Core'], 'barbell', 'compound', 'Squat', 205, [5, 8],
    ['Elbows high the whole rep', 'Stay upright — sit straight down', 'Drive the elbows up out of the hole']),
  x('Leg press', 'Quads', ['Glutes'], 'machine', 'compound', 'Squat', 360, [8, 12],
    ['Feet shoulder width, mid-platform', 'Lower until just before the hips tuck', 'Do not lock the knees hard']),
  x('Hack squat', 'Quads', ['Glutes'], 'machine', 'compound', 'Squat', 200, [8, 12],
    ['Back and hips flat on the pad', 'Go as deep as you can control', 'Push through the whole foot']),
  x('Bulgarian split squat', 'Quads', ['Glutes'], 'dumbbell', 'accessory', 'Squat', 40, [8, 12],
    ['Rear foot on a bench, laces down', 'Drop straight down', 'Front heel stays planted'], { each: true }),
  x('Walking lunge', 'Quads', ['Glutes'], 'dumbbell', 'accessory', 'Squat', 40, [10, 12],
    ['Long enough step to keep the heel down', 'Back knee kisses the floor', 'Torso tall'], { each: true }),
  x('Goblet squat', 'Quads', ['Glutes', 'Core'], 'dumbbell', 'accessory', 'Squat', 70, [8, 12],
    ['Dumbbell tight to the chest', 'Elbows inside the knees at the bottom', 'Stay upright'], { single: true }),
  x('Dumbbell step-up', 'Quads', ['Glutes'], 'dumbbell', 'accessory', 'Squat', 30, [8, 12],
    ['Whole foot on the box', 'Drive through the top leg only', 'Lower under control'], { each: true }),
  x('Leg extension', 'Quads', [], 'machine', 'isolation', 'Squat', 120, [12, 15],
    ['Knee lined up with the pivot', 'Squeeze hard at the top', 'Three seconds down']),
  x('Bodyweight squat', 'Quads', ['Glutes'], 'bodyweight', 'accessory', null, 0, [15, 25],
    ['Sit between the hips', 'Chest up, heels down', 'Pause at the bottom to make it harder'], { basic: true }),
  x('Reverse lunge', 'Quads', ['Glutes'], 'bodyweight', 'accessory', null, 0, [10, 15],
    ['Step back, drop the knee', 'Front shin stays near vertical', 'Push through the front heel'], { basic: true, each: true }),
  x('Bodyweight split squat', 'Quads', ['Glutes'], 'bodyweight', 'accessory', null, 0, [8, 15],
    ['Rear foot elevated if you can', 'Slow three-second descent', 'Front heel planted'], { basic: true, each: true }),
  x('Assisted pistol squat', 'Quads', ['Glutes'], 'bodyweight', 'compound', null, 0, [5, 10],
    ['Hold a post or doorframe lightly', 'Sit back and down on one leg', 'Use as little help as you can'], { basic: true, each: true }),

  // ── Hamstrings ───────────────────────────────────────────────────────
  x('Romanian deadlift', 'Hamstrings', ['Glutes', 'Back'], 'barbell', 'compound', 'Deadlift', 205, [6, 10],
    ['Soft knees, push the hips back', 'Bar slides down the thighs', 'Stop when the hamstrings are fully stretched']),
  x('Good morning', 'Hamstrings', ['Glutes', 'Back'], 'barbell', 'accessory', 'Deadlift', 115, [8, 12],
    ['Bar on the upper back, brace', 'Hinge until the torso nears parallel', 'Keep the back flat']),
  x('Dumbbell Romanian deadlift', 'Hamstrings', ['Glutes', 'Back'], 'dumbbell', 'accessory', 'Deadlift', 65, [8, 12],
    ['Dumbbells stay close to the legs', 'Hips back, shins vertical', 'Stand tall by squeezing the glutes']),
  x('Single-leg Romanian deadlift', 'Hamstrings', ['Glutes'], 'dumbbell', 'accessory', 'Deadlift', 35, [8, 12],
    ['Hips stay square to the floor', 'Reach the back leg long', 'Slow and balanced'], { each: true }),
  x('Seated leg curl', 'Hamstrings', [], 'machine', 'isolation', 'Squat', 100, [10, 15],
    ['Thigh pad snug', 'Curl all the way under', 'Resist on the way back']),
  x('Lying leg curl', 'Hamstrings', [], 'machine', 'isolation', 'Squat', 90, [10, 15],
    ['Hips pressed into the pad', 'Heels toward the glutes', 'Do not let the stack slam']),
  x('Back extension', 'Hamstrings', ['Glutes', 'Back'], 'machine', 'accessory', null, 0, [10, 15],
    ['Pad just below the hip crease', 'Round nothing — hinge at the hips', 'Squeeze the glutes at the top']),
  x('Nordic curl', 'Hamstrings', [], 'bodyweight', 'accessory', null, 0, [4, 8],
    ['Anchor the ankles', 'Lower as slowly as you can', 'Catch with the hands, push back up'], { basic: true }),
  x('Sliding leg curl', 'Hamstrings', ['Glutes'], 'bodyweight', 'isolation', null, 0, [8, 15],
    ['Heels on towels or sliders', 'Hips stay lifted', 'Slide out slow, curl back in'], { basic: true }),
  x('Hamstring walkout', 'Hamstrings', ['Glutes'], 'bodyweight', 'isolation', null, 0, [6, 12],
    ['Start in a glute bridge', 'Walk the heels out in small steps', 'Keep the hips up the whole time'], { basic: true }),

  // ── Glutes ───────────────────────────────────────────────────────────
  x('Hip thrust', 'Glutes', ['Hamstrings'], 'barbell', 'compound', 'Squat', 245, [8, 12],
    ['Upper back on the bench edge', 'Chin tucked, ribs down', 'Full lockout — hold for a second']),
  x('Dumbbell hip thrust', 'Glutes', ['Hamstrings'], 'dumbbell', 'accessory', 'Squat', 70, [10, 15],
    ['Dumbbell across the hips', 'Shins vertical at the top', 'Pause at lockout'], { single: true }),
  x('Cable pull-through', 'Glutes', ['Hamstrings'], 'cable', 'accessory', 'Squat', 70, [12, 15],
    ['Face away, rope between the legs', 'Hinge back, then snap the hips through', 'Arms just hold on']),
  x('Cable kickback', 'Glutes', [], 'cable', 'isolation', 'Squat', 25, [12, 15],
    ['Brace on the machine', 'Kick straight back from the hip', 'No arching the low back'], { each: true }),
  x('Hip abduction machine', 'Glutes', [], 'machine', 'isolation', 'Squat', 110, [15, 20],
    ['Lean slightly forward', 'Push the knees wide', 'Control the return']),
  x('Glute bridge', 'Glutes', ['Hamstrings'], 'bodyweight', 'accessory', null, 0, [15, 25],
    ['Heels close to the hips', 'Drive through the heels', 'Squeeze for two seconds at the top'], { basic: true }),
  x('Single-leg glute bridge', 'Glutes', ['Hamstrings'], 'bodyweight', 'accessory', null, 0, [10, 15],
    ['One knee pulled to the chest', 'Hips level as you lift', 'Pause at the top'], { basic: true, each: true }),

  // ── Biceps ───────────────────────────────────────────────────────────
  x('Barbell curl', 'Biceps', [], 'barbell', 'accessory', 'Deadlift', 70, [8, 12],
    ['Elbows pinned to the sides', 'No swinging from the hips', 'Lower all the way']),
  x('EZ-bar curl', 'Biceps', [], 'barbell', 'accessory', 'Deadlift', 65, [8, 12],
    ['Grip the angled part', 'Curl to the chin', 'Three seconds down']),
  x('Incline dumbbell curl', 'Biceps', [], 'dumbbell', 'isolation', 'Deadlift', 25, [10, 15],
    ['Bench at about 60°', 'Arms hang straight down behind you', 'Curl without moving the elbows']),
  x('Dumbbell curl', 'Biceps', [], 'dumbbell', 'isolation', 'Deadlift', 30, [8, 12],
    ['Turn the palm up as you lift', 'Elbows stay by the ribs', 'Full stretch at the bottom']),
  x('Hammer curl', 'Biceps', [], 'dumbbell', 'isolation', 'Deadlift', 30, [10, 12],
    ['Thumbs up the whole way', 'Curl across the body or straight up', 'No shoulder swing']),
  x('Cable curl', 'Biceps', [], 'cable', 'isolation', 'Deadlift', 50, [10, 15],
    ['Step back so the stack stays lifted', 'Elbows fixed', 'Squeeze at the top']),
  x('Preacher curl', 'Biceps', [], 'machine', 'isolation', 'Deadlift', 60, [10, 12],
    ['Armpits over the pad', 'Lower until nearly straight', 'No bouncing out of the bottom']),
  x('Band curl', 'Biceps', [], 'band', 'isolation', null, 0, [15, 25],
    ['Stand on the band', 'Elbows pinned', 'Slow on the way down']),
  x('Underhand inverted row', 'Biceps', ['Back'], 'bodyweight', 'isolation', null, 0, [8, 15],
    ['Palms facing you', 'Pull the chin to the bar', 'Body stays straight'], { basic: true }),

  // ── Triceps ──────────────────────────────────────────────────────────
  x('Close-grip bench press', 'Triceps', ['Chest', 'Shoulders'], 'barbell', 'compound', 'Bench', 155, [6, 10],
    ['Hands just inside shoulder width', 'Elbows tucked close', 'Touch low on the chest']),
  x('Triceps pushdown', 'Triceps', [], 'cable', 'isolation', 'Bench', 55, [10, 15],
    ['Elbows locked at the sides', 'Push to full lockout', 'Do not let the shoulders roll forward']),
  x('Skull crusher', 'Triceps', [], 'barbell', 'isolation', 'Bench', 65, [8, 12],
    ['Lower to just behind the head', 'Upper arms angled slightly back', 'Elbows stay narrow']),
  x('Overhead triceps extension', 'Triceps', [], 'dumbbell', 'isolation', 'Bench', 45, [10, 15],
    ['One dumbbell, both hands', 'Elbows point forward', 'Deep stretch behind the head'], { single: true }),
  x('Cable overhead extension', 'Triceps', [], 'cable', 'isolation', 'Bench', 45, [10, 15],
    ['Face away from the stack', 'Elbows high by the ears', 'Extend fully each rep']),
  x('Dumbbell kickback', 'Triceps', [], 'dumbbell', 'isolation', 'Bench', 15, [12, 15],
    ['Upper arm parallel to the floor', 'Straighten the elbow completely', 'No swinging'], { each: true }),
  x('Diamond push-up', 'Triceps', ['Chest'], 'bodyweight', 'accessory', null, 0, [8, 15],
    ['Hands together under the chest', 'Elbows brush the ribs', 'Full lockout'], { basic: true }),
  x('Bench dip', 'Triceps', ['Shoulders'], 'bodyweight', 'isolation', null, 0, [10, 20],
    ['Hands on a bench behind you', 'Lower until the elbows hit 90°', 'Straighten the legs to make it harder'], { basic: true }),

  // ── Calves ───────────────────────────────────────────────────────────
  x('Standing calf raise', 'Calves', [], 'machine', 'isolation', 'Squat', 180, [10, 15],
    ['Full stretch at the bottom', 'Up onto the big toe', 'Two-second pause at the top']),
  x('Seated calf raise', 'Calves', [], 'machine', 'isolation', 'Squat', 90, [12, 20],
    ['Pad just above the knees', 'Sink into the stretch', 'No bouncing']),
  x('Leg press calf raise', 'Calves', [], 'machine', 'isolation', 'Squat', 200, [12, 15],
    ['Balls of the feet on the platform edge', 'Knees soft, not locked', 'Full range every rep']),
  x('Single-leg dumbbell calf raise', 'Calves', [], 'dumbbell', 'isolation', 'Squat', 35, [10, 15],
    ['Stand on a step edge', 'Dumbbell on the working side', 'Pause top and bottom'], { each: true, single: true }),
  x('Single-leg calf raise', 'Calves', [], 'bodyweight', 'isolation', null, 0, [12, 20],
    ['Heel hangs off a step', 'Hold something for balance only', 'Slow all the way down'], { basic: true, each: true }),

  // ── Core ─────────────────────────────────────────────────────────────
  x('Cable crunch', 'Core', [], 'cable', 'isolation', 'Squat', 80, [12, 15],
    ['Kneel, rope beside the head', 'Curl the ribs toward the hips', 'Hips stay still']),
  x('Hanging leg raise', 'Core', [], 'bodyweight', 'isolation', null, 0, [8, 15],
    ['No swinging', 'Curl the pelvis up, not just the legs', 'Lower slowly']),
  x('Pallof press', 'Core', [], 'cable', 'isolation', 'Squat', 30, [10, 12],
    ['Stand side-on to the cable', 'Press straight out and resist the twist', 'Hips and shoulders stay square'], { each: true }),
  x('Plank', 'Core', [], 'bodyweight', 'isolation', null, 0, [30, 60],
    ['Elbows under shoulders', 'Squeeze glutes and quads', 'Ribs tucked — no sagging'], { unit: 'sec', basic: true }),
  x('Side plank', 'Core', [], 'bodyweight', 'isolation', null, 0, [20, 45],
    ['Elbow under the shoulder', 'Hips stacked and high', 'One straight line head to heel'], { unit: 'sec', basic: true, each: true }),
  x('Reverse crunch', 'Core', [], 'bodyweight', 'isolation', null, 0, [10, 20],
    ['Low back pressed down', 'Roll the hips off the floor', 'Lower without swinging'], { basic: true }),
  x('Dead bug', 'Core', [], 'bodyweight', 'isolation', null, 0, [8, 12],
    ['Low back glued to the floor', 'Reach the opposite arm and leg long', 'Move slowly'], { basic: true, each: true }),
  x('Crunch', 'Core', [], 'bodyweight', 'isolation', null, 0, [15, 25],
    ['Chin off the chest', 'Lift the shoulder blades only', 'Exhale at the top'], { basic: true })
];

export const CONDITIONING = [
  { name: 'Easy bike', muscle: null, secondary: [], equipment: 'machine', tier: 'conditioning', ref: null, base: 0, reps: [8, 10], unit: 'min', cues: ['Conversational pace', 'Light resistance', 'Just get warm'] },
  { name: 'Brisk walk', muscle: null, secondary: [], equipment: 'bodyweight', tier: 'conditioning', ref: null, base: 0, reps: [10, 15], unit: 'min', cues: ['Fast enough to breathe a little harder', 'Arms swinging', 'Outside if you can'] }
];

export const EXERCISES_BY_NAME = Object.fromEntries([...EXERCISES, ...CONDITIONING].map(e => [e.name, e]));

export const EQUIPMENT_LEVELS = [
  { k: 'full', label: 'Full gym', blurb: 'Barbells, machines, cables, dumbbells' },
  { k: 'garage', label: 'Barbell & dumbbells', blurb: 'Home or garage gym with a rack' },
  { k: 'dumbbell', label: 'Dumbbells only', blurb: 'Dumbbells and a bench, no barbell' },
  { k: 'bodyweight', label: 'Bodyweight only', blurb: 'No equipment' }
];
export const EQUIPMENT_BY_LEVEL = {
  full: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'weighted', 'band'],
  garage: ['barbell', 'dumbbell', 'bodyweight', 'weighted', 'band'],
  dumbbell: ['dumbbell', 'bodyweight', 'weighted', 'band'],
  bodyweight: ['bodyweight']
};
export const EQUIPMENT_LABEL = { barbell: 'Barbell', dumbbell: 'Dumbbell', machine: 'Machine', cable: 'Cable', bodyweight: 'Bodyweight', weighted: 'Weighted', band: 'Band' };

export const GOALS = [
  { k: 'both', label: 'Strength & muscle', blurb: 'Balanced rep ranges' },
  { k: 'strength', label: 'Strength', blurb: 'Heavier, lower reps, longer rests' },
  { k: 'muscle', label: 'Muscle', blurb: 'Moderate loads, more reps' }
];

// ── Split blueprints ─────────────────────────────────────────────────────
// A day is a list of targets. Role sets the dose:
//   primary   — a compound plus an accessory (the day's main driver)
//   main      — one compound only
//   secondary — one lighter movement
// `lift` names the preferred exercise when the person's equipment allows it
// (the anchors that stay put so the big lifts can actually be tracked);
// otherwise the generator picks from the library and rotates that pick
// between training blocks.
const P = (m, lift) => ({ m, r: 'primary', lift });
const M = (m, lift) => ({ m, r: 'main', lift });
const S = (m, lift, tier) => ({ m, r: 'secondary', lift, tier });

const CHEST_DAY = [P('Chest', 'Bench press'), M('Chest', 'Incline barbell press'), S('Chest', null, 'isolation'), S('Triceps')];
const BACK_DAY = [M('Back', 'Deadlift'), P('Back', 'Barbell row'), S('Back', 'Lat pulldown'), S('Biceps')];
const SHOULDER_DAY = [P('Shoulders', 'Overhead press'), S('Shoulders', 'Face pull'), S('Triceps'), S('Core')];
const LEG_DAY = [P('Quads', 'Back squat'), P('Hamstrings', 'Romanian deadlift'), M('Glutes', 'Hip thrust'), S('Calves')];
const ARM_DAY = [P('Biceps', 'Barbell curl'), P('Triceps', 'Close-grip bench press'), S('Biceps'), S('Triceps'), S('Core')];

export const MUSCLE_FOCUS = {
  chest: { title: 'Chest focus', targets: CHEST_DAY },
  back: { title: 'Back focus', targets: BACK_DAY },
  legs: { title: 'Legs focus', targets: LEG_DAY }
};

export const STYLE_TEMPLATES = {
  full_body: [
    { title: 'Full body A', targets: [M('Quads', 'Back squat'), M('Chest', 'Bench press'), M('Back', 'Barbell row'), S('Hamstrings'), S('Shoulders'), S('Core')] },
    { title: 'Full body B', targets: [M('Hamstrings', 'Deadlift'), M('Shoulders', 'Overhead press'), M('Back', 'Weighted pull-up'), S('Quads'), S('Chest'), S('Calves')] },
    { title: 'Full body C', targets: [M('Quads', 'Front squat'), M('Chest', 'Incline barbell press'), M('Back', 'Chest-supported row'), S('Glutes'), S('Biceps'), S('Triceps')] }
  ],
  upper_lower: [
    { title: 'Upper A', targets: [P('Chest', 'Bench press'), P('Back', 'Barbell row'), S('Shoulders'), S('Triceps'), S('Biceps')] },
    { title: 'Lower A', targets: [P('Quads', 'Back squat'), P('Hamstrings', 'Romanian deadlift'), S('Calves'), S('Core')] },
    { title: 'Upper B', targets: [P('Shoulders', 'Overhead press'), P('Back', 'Weighted pull-up'), S('Chest'), S('Biceps'), S('Triceps')] },
    { title: 'Lower B', targets: [M('Hamstrings', 'Deadlift'), P('Quads', 'Front squat'), M('Glutes', 'Hip thrust'), S('Calves'), S('Core')] }
  ],
  push_pull_legs: [
    { title: 'Push A', targets: [P('Chest', 'Bench press'), P('Shoulders', 'Overhead press'), S('Triceps')] },
    { title: 'Pull A', targets: [M('Back', 'Deadlift'), P('Back', 'Weighted pull-up'), S('Shoulders', 'Face pull'), S('Biceps')] },
    { title: 'Legs A', targets: [P('Quads', 'Back squat'), P('Hamstrings', 'Romanian deadlift'), S('Calves'), S('Core')] },
    { title: 'Push B', targets: [P('Shoulders', 'Overhead press'), P('Chest', 'Incline barbell press'), S('Triceps')] },
    { title: 'Pull B', targets: [P('Back', 'Barbell row'), M('Back', 'Lat pulldown'), S('Shoulders', 'Reverse pec deck'), S('Biceps')] },
    { title: 'Legs B', targets: [P('Quads', 'Front squat'), M('Glutes', 'Hip thrust'), S('Hamstrings'), S('Calves'), S('Core')] }
  ],
  bro_split: [
    { title: 'Chest', targets: CHEST_DAY },
    { title: 'Back', targets: BACK_DAY },
    { title: 'Shoulders', targets: SHOULDER_DAY },
    { title: 'Legs', targets: LEG_DAY },
    { title: 'Arms', targets: ARM_DAY }
  ]
};

// Default style when split is left on Auto. Hitting each muscle about twice
// a week beats once for most people, so low day counts get full-body work
// rather than a split that would fragment volume.
export const AUTO_STYLE_BY_DAYS = { 1: 'full_body', 2: 'full_body', 3: 'full_body', 4: 'upper_lower', 5: 'push_pull_legs', 6: 'push_pull_legs', 7: 'push_pull_legs' };

export const SPLIT_STYLES = [
  { k: 'auto', label: 'Auto', blurb: 'Picked from your training days' },
  { k: 'full_body', label: 'Full body', blurb: 'Everything, every session' },
  { k: 'upper_lower', label: 'Upper / Lower', blurb: 'Alternating upper and lower days' },
  { k: 'push_pull_legs', label: 'Push / Pull / Legs', blurb: 'Six-day rotation, two variants of each' },
  { k: 'bro_split', label: 'One muscle a day', blurb: 'Chest, back, shoulders, legs, arms' }
];

export const PIVOTS = [
  { k: 'nobar', label: 'No barbells' },
  { k: 'chest', label: 'Chest focus' },
  { k: 'back', label: 'Back focus' },
  { k: 'legs', label: 'Legs focus' },
  { k: 'sore', label: 'Sore' }
];

// Which tier fills the second slot for a primary muscle, and what a
// "secondary" dose looks like: big muscles get a moderate movement, small
// ones go straight to isolation.
export const SMALL_MUSCLES = new Set(['Shoulders', 'Biceps', 'Triceps', 'Calves', 'Core']);

// "per hand" / "per side" / "added" — the qualifier that makes a number
// unambiguous at the rack.
export function loadHint(def) {
  if (!def) return '';
  if (def.equipment === 'weighted') return 'added';
  if (def.equipment === 'dumbbell' && !def.single) return 'per hand';
  if (def.equipment === 'cable' && def.each) return 'per side';
  return '';
}
// Total load actually moved per rep, for volume totals.
export function loadFactor(def) {
  return def && def.equipment === 'dumbbell' && !def.single && !def.each ? 2 : 1;
}
