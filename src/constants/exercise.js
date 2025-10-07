// Exercise Constants
// These constants define the valid values for exercise properties

const BODY_PARTS = [
  "all",
    "chest",
    "lowerback",
    "back",
    "shoulders",
    "upperabs",
    "sideabs",
    "biceps",
    "triceps",
    "legs",
    "middlequads",
    "innerquads",
    "hamstrings",
    "glutes",
    "core",
    "calves",
    "frontcalves",
    "forearms",
    "lats",
    "traps",
    "reardelts",
    "full-body",
];

const EXERCISE_TYPES = [
  'cardio',
  'compound',
  'isolated',
  'mobility',
  'calisthenics',
  'endurance'
];

const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced'
];

// Equipment categories (optional - can be extended)
const COMMON_EQUIPMENT = [
  'barbell',
  'dumbbell',
  'dumbbells',
  'kettlebell',
  'resistance-band',
  'pull-up-bar',
  'bench',
  'squat-rack',
  'cable-machine',
  'smith-machine',
  'leg-press',
  'treadmill',
  'stationary-bike',
  'rowing-machine',
  'elliptical',
  'medicine-ball',
  'stability-ball',
  'foam-roller',
  'yoga-mat',
  'none' // for bodyweight exercises
];

// Validation helpers
const isValidBodyPart = (bodyPart) => BODY_PARTS.includes(bodyPart);
const isValidExerciseType = (exerciseType) => EXERCISE_TYPES.includes(exerciseType);
const isValidDifficulty = (difficulty) => DIFFICULTY_LEVELS.includes(difficulty);

module.exports = {
  BODY_PARTS,
  EXERCISE_TYPES,
  DIFFICULTY_LEVELS,
  COMMON_EQUIPMENT,
  isValidBodyPart,
  isValidExerciseType,
  isValidDifficulty
};