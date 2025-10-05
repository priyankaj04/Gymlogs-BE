const express = require('express');
const ExerciseController = require('../controllers/exerciseController');
const { validateExercise, validateExerciseUpdate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
/// router.use(authenticate);

// CRUD routes
router.post('/', validateExercise, ExerciseController.createExercise);
router.get('/', ExerciseController.getAllExercises);
router.get('/constants', ExerciseController.getExerciseConstants);
router.get('/filters', ExerciseController.getExerciseFilters);
router.get('/stats', ExerciseController.getExerciseStats);
router.get('/by-body-part', ExerciseController.getExercisesByBodyPart);
router.get('/:id', ExerciseController.getExerciseById);
router.put('/:id', validateExerciseUpdate, ExerciseController.updateExercise);

module.exports = router;
