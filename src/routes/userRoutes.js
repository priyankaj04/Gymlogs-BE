const express = require('express');
const UserController = require('../controllers/userController');
const { validateUser, validateUserUpdate, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validateUser, UserController.createUser);
router.post('/login', validateLogin, UserController.loginUser);

// Protected routes (require authentication)
router.get('/', authenticate, UserController.getAllUsers);
router.get('/:id', authenticate, UserController.getUserById);
router.put('/:id', authenticate, validateUserUpdate, UserController.updateUser);
router.delete('/:id', authenticate, UserController.deleteUser);

module.exports = router;