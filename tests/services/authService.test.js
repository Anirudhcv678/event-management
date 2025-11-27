const authService = require('../../services/authService');
const userRepository = require('../../repositories/userRepository');
const bcrypt = require('bcrypt');
require('../setup');

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register(
        'newuser@example.com',
        'password123',
        'New User',
        'attendee'
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.name).toBe('New User');
      expect(result.user.role).toBe('attendee');
      expect(result.user.password).toBeUndefined();
      expect(result.token).toBeDefined();
    });

    it('should hash password before storing', async () => {
      await authService.register(
        'hash@example.com',
        'password123',
        'Hash User'
      );

      const user = await userRepository.findByEmail('hash@example.com');
      expect(user.password).not.toBe('password123');
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should default role to attendee if not provided', async () => {
      const result = await authService.register(
        'default@example.com',
        'password123',
        'Default User'
      );

      expect(result.user.role).toBe('attendee');
    });

    it('should throw error if user already exists', async () => {
      await authService.register(
        'duplicate@example.com',
        'password123',
        'Duplicate User'
      );

      await expect(
        authService.register(
          'duplicate@example.com',
          'password123',
          'Duplicate User'
        )
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw error for invalid role', async () => {
      await expect(
        authService.register(
          'invalid@example.com',
          'password123',
          'Invalid User',
          'admin'
        )
      ).rejects.toThrow('Role must be either "attendee" or "organizer"');
    });

    it('should generate valid JWT token', async () => {
      const result = await authService.register(
        'token@example.com',
        'password123',
        'Token User'
      );

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      
      // Token should be decodable
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'default-secret');
      expect(decoded.email).toBe('token@example.com');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register(
        'login@example.com',
        'password123',
        'Login User'
      );
    });

    it('should login user with correct credentials', async () => {
      const result = await authService.login('login@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
      expect(result.user.password).toBeUndefined();
      expect(result.token).toBeDefined();
    });

    it('should throw error for incorrect password', async () => {
      await expect(
        authService.login('login@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should generate valid JWT token on login', async () => {
      const result = await authService.login('login@example.com', 'password123');

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'default-secret');
      expect(decoded.email).toBe('login@example.com');
    });
  });

  describe('generateToken', () => {
    it('should generate token with user information', async () => {
      const user = await userRepository.create({
        email: 'tokenuser@example.com',
        password: 'hashed',
        name: 'Token User',
        role: 'organizer'
      });

      const token = authService.generateToken(user);

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      
      expect(decoded.userId).toBe(user._id.toString());
      expect(decoded.email).toBe('tokenuser@example.com');
      expect(decoded.role).toBe('organizer');
    });
  });
});

