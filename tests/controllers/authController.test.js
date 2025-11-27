const authController = require('../../controllers/authController');
const authService = require('../../services/authService');
require('../setup');

// Mock the service
jest.mock('../../services/authService');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'attendee'
      };

      const mockResult = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'attendee'
        },
        token: 'mock-token'
      };

      authService.register.mockResolvedValue(mockResult);

      await authController.register(req, res);

      expect(authService.register).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User',
        'attendee'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockResult
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        email: 'test@example.com'
        // Missing password and name
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email, password, and name are required'
      });
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should return 409 if user already exists', async () => {
      req.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };

      authService.register.mockRejectedValue(
        new Error('User with this email already exists')
      );

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists'
      });
    });

    it('should return 400 for invalid role', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      };

      authService.register.mockRejectedValue(
        new Error('Role must be either "attendee" or "organizer"')
      );

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 for other errors', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      authService.register.mockRejectedValue(new Error('Database error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error registering user',
        error: 'Database error'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResult = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        token: 'mock-token'
      };

      authService.login.mockResolvedValue(mockResult);

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockResult
      });
    });

    it('should return 400 if email or password missing', async () => {
      req.body = {
        email: 'test@example.com'
        // Missing password
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email and password are required'
      });
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      authService.login.mockRejectedValue(
        new Error('Invalid email or password')
      );

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return 500 for other errors', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      authService.login.mockRejectedValue(new Error('Database error'));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

