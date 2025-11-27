const Registration = require('../models/Registration');

class RegistrationRepository {
  // Check if user is registered for event
  async isRegistered(eventId, userId) {
    try {
      const registration = await Registration.findOne({
        eventId,
        userId
      });
      return !!registration;
    } catch (error) {
      throw error;
    }
  }

  // Register user for event
  async create(eventId, userId) {
    try {
      // Check if already registered
      const existing = await Registration.findOne({ eventId, userId });
      if (existing) {
        return null; // Already registered
      }
      
      const registration = new Registration({
        eventId,
        userId
      });
      return await registration.save();
    } catch (error) {
      // Handle duplicate key error (unique index)
      if (error.code === 11000) {
        return null; // Already registered
      }
      throw error;
    }
  }

  // Get all registrations for a user
  async getByUser(userId) {
    try {
      return await Registration.find({ userId })
        .populate('eventId', 'title date time description')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get all registrations for an event
  async getByEvent(eventId) {
    try {
      return await Registration.find({ eventId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Delete all registrations for an event
  async deleteByEvent(eventId) {
    try {
      const result = await Registration.deleteMany({ eventId });
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RegistrationRepository();

