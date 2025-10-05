const { BODY_PARTS, EXERCISE_TYPES, DIFFICULTY_LEVELS, COMMON_EQUIPMENT } = require('../constants/exercise');

/**
 * Exercise utility functions for validation and data processing
 */
class ExerciseUtils {
  /**
   * Validate exercise data before database operations
   * @param {Object} exerciseData - The exercise data to validate
   * @returns {Object} - Validation result with isValid boolean and errors array
   */
  static validateExerciseData(exerciseData) {
    const errors = [];
    const { body_part, exercise_type, difficulty, equipment } = exerciseData;

    // Validate body_part
    if (body_part && !BODY_PARTS.includes(body_part)) {
      errors.push(`Invalid body_part: ${body_part}. Must be one of: ${BODY_PARTS.join(', ')}`);
    }

    // Validate exercise_type
    if (exercise_type && !EXERCISE_TYPES.includes(exercise_type)) {
      errors.push(`Invalid exercise_type: ${exercise_type}. Must be one of: ${EXERCISE_TYPES.join(', ')}`);
    }

    // Validate difficulty
    if (difficulty && !DIFFICULTY_LEVELS.includes(difficulty)) {
      errors.push(`Invalid difficulty: ${difficulty}. Must be one of: ${DIFFICULTY_LEVELS.join(', ')}`);
    }

    // Validate equipment array
    if (equipment && Array.isArray(equipment)) {
      const invalidEquipment = equipment.filter(item => typeof item !== 'string' || item.trim() === '');
      if (invalidEquipment.length > 0) {
        errors.push('All equipment items must be non-empty strings');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get all available constants for client-side use
   * @returns {Object} - All exercise constants
   */
  static getConstants() {
    return {
      BODY_PARTS,
      EXERCISE_TYPES,
      DIFFICULTY_LEVELS,
      COMMON_EQUIPMENT
    };
  }

  /**
   * Generate SQL CHECK constraint for body_part
   * @returns {string} - SQL CHECK constraint string
   */
  static getBodyPartCheckConstraint() {
    return `body_part IN ('${BODY_PARTS.join("', '")}')`;
  }

  /**
   * Generate SQL CHECK constraint for exercise_type
   * @returns {string} - SQL CHECK constraint string
   */
  static getExerciseTypeCheckConstraint() {
    return `exercise_type IN ('${EXERCISE_TYPES.join("', '")}')`;
  }

  /**
   * Generate SQL CHECK constraint for difficulty
   * @returns {string} - SQL CHECK constraint string
   */
  static getDifficultyCheckConstraint() {
    return `difficulty IN ('${DIFFICULTY_LEVELS.join("', '")}')`;
  }

  /**
   * Format exercise data for API response
   * @param {Object} exercise - Raw exercise data from database
   * @returns {Object} - Formatted exercise data
   */
  static formatExerciseResponse(exercise) {
    if (!exercise) return null;

    return {
      ...exercise,
      equipment: exercise.equipment ? JSON.parse(exercise.equipment) : null,
      created_at: exercise.created_at,
      updated_at: exercise.updated_at
    };
  }

  /**
   * Format exercise data for database insertion
   * @param {Object} exercise - Exercise data from API request
   * @returns {Object} - Formatted exercise data for database
   */
  static formatExerciseForDatabase(exercise) {
    return {
      ...exercise,
      equipment: exercise.equipment ? JSON.stringify(exercise.equipment) : null,
      created_at: exercise.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Get exercise difficulty level as number (for sorting/filtering)
   * @param {string} difficulty - Difficulty level string
   * @returns {number} - Numeric difficulty level
   */
  static getDifficultyLevel(difficulty) {
    const levels = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    };
    return levels[difficulty] || 0;
  }

  /**
   * Group exercises by body part
   * @param {Array} exercises - Array of exercise objects
   * @returns {Object} - Exercises grouped by body part
   */
  static groupExercisesByBodyPart(exercises) {
    return exercises.reduce((acc, exercise) => {
      const bodyPart = exercise.body_part;
      if (!acc[bodyPart]) {
        acc[bodyPart] = [];
      }
      acc[bodyPart].push(exercise);
      return acc;
    }, {});
  }

  /**
   * Filter exercises by multiple criteria
   * @param {Array} exercises - Array of exercise objects
   * @param {Object} filters - Filter criteria
   * @returns {Array} - Filtered exercises
   */
  static filterExercises(exercises, filters = {}) {
    return exercises.filter(exercise => {
      if (filters.body_part && exercise.body_part !== filters.body_part) {
        return false;
      }
      if (filters.exercise_type && exercise.exercise_type !== filters.exercise_type) {
        return false;
      }
      if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
        return false;
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const nameMatch = exercise.name.toLowerCase().includes(searchTerm);
        const descriptionMatch = exercise.description.toLowerCase().includes(searchTerm);
        if (!nameMatch && !descriptionMatch) {
          return false;
        }
      }
      return true;
    });
  }
}

module.exports = ExerciseUtils;