const mongoose = require('mongoose');
const eventRepository = require('../../repositories/eventRepository');
const userRepository = require('../../repositories/userRepository');
const Event = require('../../models/Event');
require('../setup');

describe('EventRepository', () => {
  let organizerId;

  beforeEach(async () => {
    // Create organizer with unique email to avoid conflicts
    const timestamp = Date.now();
    const organizer = await userRepository.create({
      email: `organizer${timestamp}@example.com`,
      password: 'hashedpassword',
      name: 'Organizer',
      role: 'organizer'
    });
    organizerId = organizer._id;
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      };

      const event = await eventRepository.create(eventData);

      expect(event).toBeDefined();
      expect(event.title).toBe('Test Event');
      expect(event.description).toBe('Test Description');
      expect(event.date).toBe('2024-12-31');
      expect(event.time).toBe('10:00');
      expect(event.organizerId.toString()).toBe(organizerId.toString());
      expect(event.participants).toEqual([]);
    });

    it('should default description to empty string if not provided', async () => {
      const eventData = {
        title: 'Test Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      };

      const event = await eventRepository.create(eventData);

      expect(event.description).toBe('');
    });
  });

  describe('findById', () => {
    it('should find event by ID with populated organizer', async () => {
      const event = await eventRepository.create({
        title: 'Find Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      const foundEvent = await eventRepository.findById(event._id);

      expect(foundEvent).toBeDefined();
      expect(foundEvent._id.toString()).toBe(event._id.toString());
      expect(foundEvent.organizerId).toBeDefined();
      expect(foundEvent.organizerId.name).toBe('Organizer');
      expect(foundEvent.organizerId.email).toBe('organizer@example.com');
    });

    it('should return null if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const foundEvent = await eventRepository.findById(fakeId);

      expect(foundEvent).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should get all events with populated organizers', async () => {
      await eventRepository.create({
        title: 'Event 1',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      await eventRepository.create({
        title: 'Event 2',
        date: '2025-01-01',
        time: '11:00',
        organizerId: organizerId
      });

      const events = await eventRepository.getAll();

      expect(events).toHaveLength(2);
      expect(events[0].organizerId).toBeDefined();
      expect(events[0].organizerId.name).toBe('Organizer');
    });

    it('should return events sorted by createdAt descending', async () => {
      const event1 = await eventRepository.create({
        title: 'First Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const event2 = await eventRepository.create({
        title: 'Second Event',
        date: '2025-01-01',
        time: '11:00',
        organizerId: organizerId
      });

      const events = await eventRepository.getAll();

      expect(events[0].title).toBe('Second Event');
      expect(events[1].title).toBe('First Event');
    });
  });

  describe('getByOrganizer', () => {
    it('should get events by organizer ID', async () => {
      const timestamp = Date.now();
      const anotherOrganizer = await userRepository.create({
        email: `another${timestamp}@example.com`,
        password: 'hashedpassword',
        name: 'Another Organizer',
        role: 'organizer'
      });

      await eventRepository.create({
        title: 'Organizer Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      await eventRepository.create({
        title: 'Another Event',
        date: '2025-01-01',
        time: '11:00',
        organizerId: anotherOrganizer._id
      });

      const events = await eventRepository.getByOrganizer(organizerId);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Organizer Event');
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      const event = await eventRepository.create({
        title: 'Original Title',
        description: 'Original Description',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      const updatedEvent = await eventRepository.update(event._id, {
        title: 'Updated Title',
        description: 'Updated Description'
      });

      expect(updatedEvent.title).toBe('Updated Title');
      expect(updatedEvent.description).toBe('Updated Description');
      expect(updatedEvent.date).toBe('2024-12-31'); // Should remain unchanged
    });
  });

  describe('delete', () => {
    it('should delete event', async () => {
      const event = await eventRepository.create({
        title: 'Delete Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      const deleted = await eventRepository.delete(event._id);

      expect(deleted).toBe(true);

      const foundEvent = await eventRepository.findById(event._id);
      expect(foundEvent).toBeNull();
    });

    it('should return false if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const deleted = await eventRepository.delete(fakeId);

      expect(deleted).toBe(false);
    });
  });

  describe('addParticipant', () => {
    it('should add participant to event', async () => {
      const timestamp = Date.now();
      const participant = await userRepository.create({
        email: `participant${timestamp}@example.com`,
        password: 'hashedpassword',
        name: 'Participant'
      });

      const event = await eventRepository.create({
        title: 'Participant Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      const updatedEvent = await eventRepository.addParticipant(event._id, participant._id);

      expect(updatedEvent.participants).toHaveLength(1);
      expect(updatedEvent.participants[0].toString()).toBe(participant._id.toString());
    });

    it('should not add duplicate participants', async () => {
      const timestamp = Date.now();
      const participant = await userRepository.create({
        email: `participant${timestamp}@example.com`,
        password: 'hashedpassword',
        name: 'Participant'
      });

      const event = await eventRepository.create({
        title: 'Participant Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      await eventRepository.addParticipant(event._id, participant._id);
      const updatedEvent = await eventRepository.addParticipant(event._id, participant._id);

      expect(updatedEvent.participants).toHaveLength(1);
    });

    it('should return null if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const participantId = new mongoose.Types.ObjectId();

      const result = await eventRepository.addParticipant(fakeId, participantId);

      expect(result).toBeNull();
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from event', async () => {
      const timestamp = Date.now();
      const participant = await userRepository.create({
        email: `participant${timestamp}@example.com`,
        password: 'hashedpassword',
        name: 'Participant'
      });

      const event = await eventRepository.create({
        title: 'Participant Event',
        date: '2024-12-31',
        time: '10:00',
        organizerId: organizerId
      });

      await eventRepository.addParticipant(event._id, participant._id);
      const updatedEvent = await eventRepository.removeParticipant(event._id, participant._id);

      expect(updatedEvent.participants).toHaveLength(0);
    });
  });
});

