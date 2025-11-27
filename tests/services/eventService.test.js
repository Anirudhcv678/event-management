const eventService = require('../../services/eventService');
const userRepository = require('../../repositories/userRepository');
const eventRepository = require('../../repositories/eventRepository');
const registrationRepository = require('../../repositories/registrationRepository');
require('../setup');

describe('EventService', () => {
  let organizerId;
  let attendeeId;

  beforeEach(async () => {
    const organizer = await userRepository.create({
      email: 'organizer@example.com',
      password: 'hashedpassword',
      name: 'Organizer',
      role: 'organizer'
    });
    organizerId = organizer._id.toString();

    const attendee = await userRepository.create({
      email: 'attendee@example.com',
      password: 'hashedpassword',
      name: 'Attendee'
    });
    attendeeId = attendee._id.toString();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const event = await eventService.createEvent(
        'Test Event',
        'Test Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      expect(event).toBeDefined();
      expect(event.title).toBe('Test Event');
      expect(event.description).toBe('Test Description');
      expect(event.date).toBe('2024-12-31');
      expect(event.time).toBe('10:00');
      expect(event.organizerId.toString()).toBe(organizerId);
    });

    it('should throw error if required fields are missing', async () => {
      await expect(
        eventService.createEvent(null, 'Description', '2024-12-31', '10:00', organizerId)
      ).rejects.toThrow('Title, date, and time are required');

      await expect(
        eventService.createEvent('Title', 'Description', null, '10:00', organizerId)
      ).rejects.toThrow('Title, date, and time are required');

      await expect(
        eventService.createEvent('Title', 'Description', '2024-12-31', null, organizerId)
      ).rejects.toThrow('Title, date, and time are required');
    });

    it('should default description to empty string', async () => {
      const event = await eventService.createEvent(
        'Test Event',
        '',
        '2024-12-31',
        '10:00',
        organizerId
      );

      expect(event.description).toBe('');
    });
  });

  describe('getEventById', () => {
    it('should get event by ID', async () => {
      const createdEvent = await eventService.createEvent(
        'Get Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      const event = await eventService.getEventById(createdEvent._id.toString());

      expect(event).toBeDefined();
      expect(event._id.toString()).toBe(createdEvent._id.toString());
      expect(event.title).toBe('Get Event');
    });

    it('should throw error if event not found', async () => {
      const fakeId = new require('mongoose').Types.ObjectId().toString();

      await expect(
        eventService.getEventById(fakeId)
      ).rejects.toThrow('Event not found');
    });
  });

  describe('updateEvent', () => {
    it('should update event if user is organizer', async () => {
      const event = await eventService.createEvent(
        'Original Title',
        'Original Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      const updatedEvent = await eventService.updateEvent(
        event._id.toString(),
        { title: 'Updated Title' },
        organizerId
      );

      expect(updatedEvent.title).toBe('Updated Title');
    });

    it('should throw error if user is not organizer', async () => {
      const event = await eventService.createEvent(
        'Original Title',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      await expect(
        eventService.updateEvent(
          event._id.toString(),
          { title: 'Updated Title' },
          attendeeId
        )
      ).rejects.toThrow('You can only update your own events');
    });

    it('should throw error if event not found', async () => {
      const fakeId = new require('mongoose').Types.ObjectId().toString();

      await expect(
        eventService.updateEvent(fakeId, { title: 'Updated' }, organizerId)
      ).rejects.toThrow('Event not found');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event if user is organizer', async () => {
      const event = await eventService.createEvent(
        'Delete Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      const deleted = await eventService.deleteEvent(event._id.toString(), organizerId);

      expect(deleted).toBe(true);

      await expect(
        eventService.getEventById(event._id.toString())
      ).rejects.toThrow('Event not found');
    });

    it('should delete all registrations when event is deleted', async () => {
      const event = await eventService.createEvent(
        'Delete Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      await registrationRepository.create(event._id, attendeeId);
      await eventService.deleteEvent(event._id.toString(), organizerId);

      const isRegistered = await registrationRepository.isRegistered(event._id, attendeeId);
      expect(isRegistered).toBe(false);
    });

    it('should throw error if user is not organizer', async () => {
      const event = await eventService.createEvent(
        'Delete Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      await expect(
        eventService.deleteEvent(event._id.toString(), attendeeId)
      ).rejects.toThrow('You can only delete your own events');
    });
  });

  describe('registerForEvent', () => {
    it('should register user for event', async () => {
      const event = await eventService.createEvent(
        'Register Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      const result = await eventService.registerForEvent(
        event._id.toString(),
        attendeeId
      );

      expect(result).toBeDefined();
      expect(result.eventId.toString()).toBe(event._id.toString());
      expect(result.eventTitle).toBe('Register Event');

      const isRegistered = await registrationRepository.isRegistered(event._id, attendeeId);
      expect(isRegistered).toBe(true);
    });

    it('should throw error if already registered', async () => {
      const event = await eventService.createEvent(
        'Register Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      await eventService.registerForEvent(event._id.toString(), attendeeId);

      await expect(
        eventService.registerForEvent(event._id.toString(), attendeeId)
      ).rejects.toThrow('You are already registered for this event');
    });

    it('should throw error if event not found', async () => {
      const fakeId = new require('mongoose').Types.ObjectId().toString();

      await expect(
        eventService.registerForEvent(fakeId, attendeeId)
      ).rejects.toThrow('Event not found');
    });
  });

  describe('getEventRegistrations', () => {
    it('should get registrations for event if user is organizer', async () => {
      const event = await eventService.createEvent(
        'Registrations Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      await eventService.registerForEvent(event._id.toString(), attendeeId);

      const registrations = await eventService.getEventRegistrations(
        event._id.toString(),
        organizerId
      );

      expect(registrations).toHaveLength(1);
      expect(registrations[0].userName).toBe('Attendee');
    });

    it('should throw error if user is not organizer', async () => {
      const event = await eventService.createEvent(
        'Registrations Event',
        'Description',
        '2024-12-31',
        '10:00',
        organizerId
      );

      await expect(
        eventService.getEventRegistrations(event._id.toString(), attendeeId)
      ).rejects.toThrow('You can only view registrations for your own events');
    });
  });
});

