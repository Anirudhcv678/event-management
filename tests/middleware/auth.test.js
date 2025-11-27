const jwt = require('jsonwebtoken');
const { authenticate, requireOrganizer } = require('../../middleware/auth');
const userRepository = require('../../repositories/userRepository');
require('../setup');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', async () => {
      const user = await userRepository.create({
        email: 'auth@example.com',
        password: 'hashedpassword',
        name: 'Auth User',
        role: 'attendee'
      });

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default-secret'
      );

      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(user._id.toString());
      expect(req.user.email).toBe('auth@example.com');
      expect(req.user.role).toBe('attendee');
    });

    it('should return 401 if no token provided', async () => {
      req.headers.authorization = undefined;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided or invalid format'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      const fakeId = new require('mongoose').Types.ObjectId();
      const token = jwt.sign(
        { userId: fakeId.toString(), email: 'fake@example.com', role: 'attendee' },
        process.env.JWT_SECRET || 'default-secret'
      );

      req.headers.authorization = `Bearer ${token}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireOrganizer', () => {
    it('should allow organizer to proceed', () => {
      req.user = {
        id: '123',
        email: 'organizer@example.com',
        role: 'organizer'
      };

      requireOrganizer(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny attendee access', () => {
      req.user = {
        id: '123',
        email: 'attendee@example.com',
        role: 'attendee'
      };

      requireOrganizer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Organizer role required.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

