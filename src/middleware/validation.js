const Joi = require('joi');
const { BODY_PARTS, EXERCISE_TYPES, DIFFICULTY_LEVELS } = require('../constants/exercise');

// User validation schemas
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email()
}).min(1);

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Gym log validation schemas
const gymLogSchema = Joi.object({
  exercise: Joi.string().min(2).max(100).required(),
  sets: Joi.number().integer().min(1).max(100).required(),
  reps: Joi.number().integer().min(1).max(1000).required(),
  weight: Joi.number().min(0).max(10000).required(),
  notes: Joi.string().max(500).allow(''),
  user_id: Joi.string().uuid().required()
});

const gymLogUpdateSchema = Joi.object({
  exercise: Joi.string().min(2).max(100),
  sets: Joi.number().integer().min(1).max(100),
  reps: Joi.number().integer().min(1).max(1000),
  weight: Joi.number().min(0).max(10000),
  notes: Joi.string().max(500).allow('')
}).min(1);

// Exercise validation schemas
const exerciseSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(5).max(1000).required(),
  body_part: Joi.string().valid(...BODY_PARTS).required(),
  exercise_type: Joi.string().valid(...EXERCISE_TYPES).required(),
  difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).optional(),
  equipment: Joi.array().items(Joi.string()).optional()
});

const exerciseUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  description: Joi.string().min(5).max(1000),
  body_part: Joi.string().valid(...BODY_PARTS),
  exercise_type: Joi.string().valid(...EXERCISE_TYPES),
  difficulty: Joi.string().valid(...DIFFICULTY_LEVELS),
  equipment: Joi.array().items(Joi.string())
}).min(1);

// Validation middleware functions
const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateUserUpdate = (req, res, next) => {
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateGymLog = (req, res, next) => {
  const { error } = gymLogSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateGymLogUpdate = (req, res, next) => {
  const { error } = gymLogUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateExercise = (req, res, next) => {
  const { error } = exerciseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateExerciseUpdate = (req, res, next) => {
  const { error } = exerciseUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

module.exports = {
  validateUser,
  validateUserUpdate,
  validateLogin,
  validateGymLog,
  validateGymLogUpdate,
  validateExercise,
  validateExerciseUpdate
};