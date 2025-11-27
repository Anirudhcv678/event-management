const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /register - User registration
router.post('/register', (req, res) => authController.register(req, res));

// POST /login - User login
router.post('/login', (req, res) => authController.login(req, res));

module.exports = router;
