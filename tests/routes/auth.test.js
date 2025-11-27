const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const authController = require('../../controllers/authController');
require('../setup');

// Mock the controller
jest.mock('../../controllers/authController');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should call register controller', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(201).json({ success: true, message: 'Registered' });
      });

      await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(authController.register).toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should call login controller', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(200).json({ success: true, message: 'Logged in' });
      });

      await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(authController.login).toHaveBeenCalled();
    });
  });
});

