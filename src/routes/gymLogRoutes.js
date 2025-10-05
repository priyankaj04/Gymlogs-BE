const express = require('express');
const GymLogController = require('../controllers/gymLogController');
const { validateGymLog, validateGymLogUpdate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', validateGymLog, GymLogController.createGymLog);
router.get('/', GymLogController.getAllGymLogs);
router.get('/:id', GymLogController.getGymLogById);
router.put('/:id', validateGymLogUpdate, GymLogController.updateGymLog);
router.delete('/:id', GymLogController.deleteGymLog);

// Statistics route
router.get('/stats/:user_id', GymLogController.getGymLogStats);

module.exports = router;