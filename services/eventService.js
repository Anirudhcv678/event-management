const eventRepository = require('../repositories/eventRepository');
const registrationRepository = require('../repositories/registrationRepository');
const userRepository = require('../repositories/userRepository');
const { sendRegistrationEmail } = require('../utils/emailService');

class EventService {
  async getAllEvents() {
    return await eventRepository.getAll();
  }

  async getEventById(id) {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  async createEvent(title, description, date, time, organizerId) {
    // Validation
    if (!title || !date || !time) {
      throw new Error('Title, date, and time are required');
    }

    const event = await eventRepository.create({
      title,
      description: description || '',
      date,
      time,
      organizerId
    });

    return event;
  }

  async updateEvent(id, updateData, userId) {
    const event = await eventRepository.findById(id);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user is the organizer of this event
    const organizerId = event.organizerId._id ? event.organizerId._id.toString() : event.organizerId.toString();
    if (organizerId !== userId) {
      throw new Error('You can only update your own events');
    }

    const updatedEvent = await eventRepository.update(id, updateData);
    return updatedEvent;
  }

  async deleteEvent(id, userId) {
    const event = await eventRepository.findById(id);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user is the organizer of this event
    const organizerId = event.organizerId._id ? event.organizerId._id.toString() : event.organizerId.toString();
    if (organizerId !== userId) {
      throw new Error('You can only delete your own events');
    }

    // Delete all registrations for this event
    await registrationRepository.deleteByEvent(id);
    
    const deleted = await eventRepository.delete(id);
    return deleted;
  }

  async registerForEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if already registered
    const isRegistered = await registrationRepository.isRegistered(eventId, userId);
    if (isRegistered) {
      throw new Error('You are already registered for this event');
    }

    // Register user for event
    const registration = await registrationRepository.create(eventId, userId);
    if (!registration) {
      throw new Error('Error registering for event');
    }

    // Add participant to event
    await eventRepository.addParticipant(eventId, userId);

    // Get user details for email
    const user = await userRepository.findById(userId);

    // Send email notification asynchronously
    sendRegistrationEmail(user.email, {
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time
    }).catch(error => {
      console.error('Failed to send registration email:', error);
      // Don't fail the request if email fails
    });

    return {
      eventId: event._id,
      eventTitle: event.title,
      registeredAt: registration.createdAt
    };
  }

  async getEventRegistrations(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user is the organizer
    const organizerId = event.organizerId._id ? event.organizerId._id.toString() : event.organizerId.toString();
    if (organizerId !== userId) {
      throw new Error('You can only view registrations for your own events');
    }

    const registrations = await registrationRepository.getByEvent(eventId);
    return registrations.map(reg => {
      const user = reg.userId; // Already populated
      return {
        registrationId: reg._id,
        userId: user._id || user,
        userName: user.name || 'Unknown',
        userEmail: user.email || 'Unknown',
        registeredAt: reg.createdAt
      };
    });
  }
}

module.exports = new EventService();

