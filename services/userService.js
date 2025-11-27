const userRepository = require('../repositories/userRepository');
const registrationRepository = require('../repositories/registrationRepository');
const eventRepository = require('../repositories/eventRepository');

class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toJSON();
  }

  async getUserRegistrations(userId) {
    const registrations = await registrationRepository.getByUser(userId);
    
    return registrations.map(reg => {
      const event = reg.eventId; // Already populated
      return {
        registrationId: reg._id,
        eventId: event._id || event,
        eventTitle: event.title || 'Event not found',
        eventDate: event.date || null,
        eventTime: event.time || null,
        eventDescription: event.description || null,
        registeredAt: reg.createdAt
      };
    });
  }
}

module.exports = new UserService();

