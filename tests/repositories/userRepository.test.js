const mongoose = require('mongoose');
const userRepository = require('../../repositories/userRepository');
const User = require('../../models/User');
require('../setup');

describe('UserRepository', () => {
  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'attendee'
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('attendee');
      expect(user._id).toBeDefined();
    });

    it('should lowercase email when creating user', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'hashedpassword',
        name: 'Test User'
      };

      const user = await userRepository.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    it('should default role to attendee if not provided', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User'
      };

      const user = await userRepository.create(userData);

      expect(user.role).toBe('attendee');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'find@example.com',
        password: 'hashedpassword',
        name: 'Find User'
      };

      await userRepository.create(userData);
      const foundUser = await userRepository.findByEmail('find@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('find@example.com');
      expect(foundUser.name).toBe('Find User');
    });

    it('should return null if user not found', async () => {
      const foundUser = await userRepository.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });

    it('should be case insensitive when finding by email', async () => {
      await userRepository.create({
        email: 'case@example.com',
        password: 'hashedpassword',
        name: 'Case User'
      });

      const foundUser = await userRepository.findByEmail('CASE@EXAMPLE.COM');

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('case@example.com');
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const userData = {
        email: 'id@example.com',
        password: 'hashedpassword',
        name: 'ID User'
      };

      const createdUser = await userRepository.create(userData);
      const foundUser = await userRepository.findById(createdUser._id);

      expect(foundUser).toBeDefined();
      expect(foundUser._id.toString()).toBe(createdUser._id.toString());
      expect(foundUser.email).toBe('id@example.com');
    });

    it('should return null if user not found by ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const foundUser = await userRepository.findById(fakeId);

      expect(foundUser).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should get all users', async () => {
      await userRepository.create({
        email: 'user1@example.com',
        password: 'hashedpassword',
        name: 'User 1'
      });

      await userRepository.create({
        email: 'user2@example.com',
        password: 'hashedpassword',
        name: 'User 2'
      });

      const users = await userRepository.getAll();

      expect(users).toHaveLength(2);
      expect(users[0].password).toBeUndefined(); // Password should be excluded
      expect(users[1].password).toBeUndefined();
    });

    it('should return empty array if no users exist', async () => {
      const users = await userRepository.getAll();

      expect(users).toHaveLength(0);
      expect(Array.isArray(users)).toBe(true);
    });
  });
});

