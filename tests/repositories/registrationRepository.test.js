const registrationRepository = require('../../repositories/registrationRepository');
const eventRepository = require('../../repositories/eventRepository');
const userRepository = require('../../repositories/userRepository');
require('../setup');

describe('RegistrationRepository', () => {
  let organizerId;
  let eventId;
  let userId;

  beforeEach(async () => {
    const organizer = await userRepository.create({
      email: 'organizer@example.com',
      password: 'hashedpassword',
      name: 'Organizer',
      role: 'organizer'
    });
    organizerId = organizer._id;

    const event = await eventRepository.create({
      title: 'Test Event',
      date: '2024-12-31',
      time: '10:00',
      organizerId: organizerId
    });
    eventId = event._id;

    const user = await userRepository.create({
      email: 'user@example.com',
      password: 'hashedpassword',
      name: 'User'
    });
    userId = user._id;
  });

  describe('create', () => {
    it('should create a new registration', async () => {
      const registration = await registrationRepository.create(eventId, userId);

      expect(registration).toBeDefined();
      expect(registration.eventId.toString()).toBe(eventId.toString());
      expect(registration.userId.toString()).toBe(userId.toString());
      expect(registration.createdAt).toBeDefined();
    });

    it('should return null if user already registered', async () => {
      await registrationRepository.create(eventId, userId);
      const duplicateRegistration = await registrationRepository.create(eventId, userId);

      expect(duplicateRegistration).toBeNull();
    });
  });

  describe('isRegistered', () => {
    it('should return true if user is registered', async () => {
      await registrationRepository.create(eventId, userId);
      const isRegistered = await registrationRepository.isRegistered(eventId, userId);

      expect(isRegistered).toBe(true);
    });

    it('should return false if user is not registered', async () => {
      const isRegistered = await registrationRepository.isRegistered(eventId, userId);

      expect(isRegistered).toBe(false);
    });
  });

  describe('getByUser', () => {
    it('should get all registrations for a user', async () => {
      const event2 = await eventRepository.create({
        title: 'Event 2',
        date: '2025-01-01',
        time: '11:00',
        organizerId: organizerId
      });

      await registrationRepository.create(eventId, userId);
      await registrationRepository.create(event2._id, userId);

      const registrations = await registrationRepository.getByUser(userId);

      expect(registrations).toHaveLength(2);
      expect(registrations[0].eventId).toBeDefined();
      expect(registrations[0].eventId.title).toBeDefined();
    });

    it('should return empty array if user has no registrations', async () => {
      const registrations = await registrationRepository.getByUser(userId);

      expect(registrations).toHaveLength(0);
      expect(Array.isArray(registrations)).toBe(true);
    });
  });

  describe('getByEvent', () => {
    it('should get all registrations for an event', async () => {
      const user2 = await userRepository.create({
        email: 'user2@example.com',
        password: 'hashedpassword',
        name: 'User 2'
      });

      await registrationRepository.create(eventId, userId);
      await registrationRepository.create(eventId, user2._id);

      const registrations = await registrationRepository.getByEvent(eventId);

      expect(registrations).toHaveLength(2);
      expect(registrations[0].userId).toBeDefined();
      expect(registrations[0].userId.name).toBeDefined();
    });

    it('should return empty array if event has no registrations', async () => {
      const registrations = await registrationRepository.getByEvent(eventId);

      expect(registrations).toHaveLength(0);
    });
  });

  describe('deleteByEvent', () => {
    it('should delete all registrations for an event', async () => {
      await registrationRepository.create(eventId, userId);
      const user2 = await userRepository.create({
        email: 'user2@example.com',
        password: 'hashedpassword',
        name: 'User 2'
      });
      await registrationRepository.create(eventId, user2._id);

      const deleted = await registrationRepository.deleteByEvent(eventId);

      expect(deleted).toBe(true);

      const registrations = await registrationRepository.getByEvent(eventId);
      expect(registrations).toHaveLength(0);
    });

    it('should return false if no registrations found', async () => {
      const deleted = await registrationRepository.deleteByEvent(eventId);

      expect(deleted).toBe(false);
    });
  });
});

