const express = require('express');
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /user/profile - Get current user profile (requires authentication)
router.get('/profile', authenticate, (req, res) => userController.getProfile(req, res));

// GET /user/registrations - Get all events user is registered for (requires authentication)
router.get('/registrations', authenticate, (req, res) => userController.getUserRegistrations(req, res));

module.exports = router;
