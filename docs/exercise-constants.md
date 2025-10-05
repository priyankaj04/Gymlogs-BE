# Exercise Constants Documentation

This document describes the centralized constants used throughout the exercise API to ensure consistency and maintainability.

## File Structure

```
src/
├── constants/
│   └── exercise.js          # Centralized exercise constants
├── utils/
│   └── exerciseUtils.js     # Utility functions using constants
├── middleware/
│   └── validation.js        # Validation schemas using constants
└── controllers/
    └── exerciseController.js # Controller using constants
```

## Constants

### Body Parts
```javascript
const BODY_PARTS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'legs', 'glutes', 'core', 'calves', 'forearms', 'full-body'
];
```

### Exercise Types
```javascript
const EXERCISE_TYPES = [
  'cardio', 'compound', 'isolated', 'mobility'
];
```

### Difficulty Levels
```javascript
const DIFFICULTY_LEVELS = [
  'beginner', 'intermediate', 'advanced'
];
```

### Common Equipment (Optional)
```javascript
const COMMON_EQUIPMENT = [
  'barbell', 'dumbbell', 'dumbbells', 'kettlebell', 
  'resistance-band', 'pull-up-bar', 'bench', 'squat-rack',
  'cable-machine', 'smith-machine', 'leg-press', 'treadmill',
  'stationary-bike', 'rowing-machine', 'elliptical', 
  'medicine-ball', 'stability-ball', 'foam-roller', 
  'yoga-mat', 'none'
];
```

## Usage

### In Validation (middleware/validation.js)
```javascript
const { BODY_PARTS, EXERCISE_TYPES, DIFFICULTY_LEVELS } = require('../constants/exercise');

const exerciseSchema = Joi.object({
  body_part: Joi.string().valid(...BODY_PARTS).required(),
  exercise_type: Joi.string().valid(...EXERCISE_TYPES).required(),
  difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).optional(),
  // ... other fields
});
```

### In Controllers (controllers/exerciseController.js)
```javascript
const { BODY_PARTS, EXERCISE_TYPES, DIFFICULTY_LEVELS } = require('../constants/exercise');
const ExerciseUtils = require('../utils/exerciseUtils');

// Using utility functions that internally use constants
const formattedData = ExerciseUtils.formatExerciseResponse(data);
const constants = ExerciseUtils.getConstants();
```

### In Database Schema (database/exercise.sql)
The SQL constraints match the constants:
```sql
body_part TEXT NOT NULL CHECK (
    body_part IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 
                  'legs', 'glutes', 'core', 'calves', 'forearms', 'full-body')
),
exercise_type TEXT NOT NULL CHECK (
    exercise_type IN ('cardio', 'compound', 'isolated', 'mobility')
),
difficulty TEXT CHECK (
    difficulty IN ('beginner', 'intermediate', 'advanced')
)
```

## Utility Functions

The `ExerciseUtils` class provides helpful methods:

### Data Validation
```javascript
const result = ExerciseUtils.validateExerciseData(exerciseData);
if (!result.isValid) {
  console.log(result.errors);
}
```

### Data Formatting
```javascript
// For API responses
const formatted = ExerciseUtils.formatExerciseResponse(dbData);

// For database insertion
const dbReady = ExerciseUtils.formatExerciseForDatabase(apiData);
```

### Filtering and Grouping
```javascript
// Group exercises by body part
const grouped = ExerciseUtils.groupExercisesByBodyPart(exercises);

// Filter exercises
const filtered = ExerciseUtils.filterExercises(exercises, {
  body_part: 'chest',
  difficulty: 'intermediate'
});
```

### Getting Constants
```javascript
const constants = ExerciseUtils.getConstants();
// Returns all constants for client-side use
```

## API Endpoint for Constants

Frontend applications can fetch all constants via:

**GET** `/api/exercises/constants`

```json
{
  "success": true,
  "data": {
    "body_parts": ["chest", "back", "shoulders", ...],
    "exercise_types": ["cardio", "compound", "isolated", "mobility"],
    "difficulty_levels": ["beginner", "intermediate", "advanced"],
    "common_equipment": ["barbell", "dumbbell", ...]
  }
}
```

## Benefits

1. **Consistency**: All validation, database constraints, and business logic use the same constants
2. **Maintainability**: Adding/removing valid values only requires updating one file
3. **Type Safety**: Centralized constants reduce typos and inconsistencies
4. **Documentation**: Constants serve as living documentation of valid values
5. **Frontend Integration**: Constants can be easily shared with frontend applications

## Adding New Values

To add new values to any constant:

1. Update the constant in `src/constants/exercise.js`
2. Update the database schema in `database/exercise.sql` if needed
3. Test the validation to ensure it works correctly
4. Update documentation and API examples as needed

## Validation Chain

1. **Frontend**: Uses constants from `/api/exercises/constants` endpoint
2. **API Validation**: Joi schemas use constants for validation
3. **Database**: CHECK constraints enforce the same values
4. **Business Logic**: Controllers use utility functions with constants

This ensures data integrity at every layer of the application.