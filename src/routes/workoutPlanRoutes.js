const express = require('express');
const WorkoutPlanController = require('../controllers/workoutPlanController');
const { 
  validateWorkoutPlan, 
  validateWorkoutPlanUpdate, 
  validateWorkoutPlanExerciseUpdate 
} = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workout Plan CRUD routes
router.post('/', validateWorkoutPlan, WorkoutPlanController.createWorkoutPlan);
router.get('/', WorkoutPlanController.getAllWorkoutPlans);
router.get('/stats', WorkoutPlanController.getWorkoutPlanStats);
router.get('/:id', WorkoutPlanController.getWorkoutPlanById);
router.put('/:id', validateWorkoutPlanUpdate, WorkoutPlanController.updateWorkoutPlan);
router.delete('/:id', WorkoutPlanController.deleteWorkoutPlan);

// Workout Plan Exercise management routes
router.post('/:planId/exercises', WorkoutPlanController.addExerciseToWorkoutPlan);
router.put('/:planId/exercises/:exerciseId', validateWorkoutPlanExerciseUpdate, WorkoutPlanController.updateExerciseInWorkoutPlan);
router.delete('/:planId/exercises/:exerciseId', WorkoutPlanController.removeExerciseFromWorkoutPlan);

module.exports = router;