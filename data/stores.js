// MongoDB data stores using Mongoose models

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// User store methods
const userStore = {
  // Find user by email
  findByEmail: async (email) => {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw error;
    }
  },

  // Find user by ID
  findById: async (id) => {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  },

  // Create new user
  create: async (userData) => {
    try {
      const user = new User({
        email: userData.email.toLowerCase(),
        password: userData.password,
        name: userData.name,
        role: userData.role || 'attendee'
      });
      return await user.save();
    } catch (error) {
      throw error;
    }
  },

  // Get all users (for admin purposes)
  getAll: async () => {
    try {
      return await User.find().select('-password');
    } catch (error) {
      throw error;
    }
  }
};

// Event store methods
const eventStore = {
  // Find event by ID
  findById: async (id) => {
    try {
      return await Event.findById(id).populate('organizerId', 'name email');
    } catch (error) {
      throw error;
    }
  },

  // Get all events
  getAll: async () => {
    try {
      return await Event.find().populate('organizerId', 'name email').sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  },

  // Get events by organizer
  getByOrganizer: async (organizerId) => {
    try {
      return await Event.find({ organizerId }).populate('organizerId', 'name email').sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  },

  // Create new event
  create: async (eventData) => {
    try {
      const event = new Event({
        title: eventData.title,
        description: eventData.description || '',
        date: eventData.date,
        time: eventData.time,
        organizerId: eventData.organizerId,
        participants: []
      });
      return await event.save();
    } catch (error) {
      throw error;
    }
  },

  // Update event
  update: async (id, eventData) => {
    try {
      const event = await Event.findByIdAndUpdate(
        id,
        { ...eventData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('organizerId', 'name email');
      return event;
    } catch (error) {
      throw error;
    }
  },

  // Delete event
  delete: async (id) => {
    try {
      const event = await Event.findByIdAndDelete(id);
      if (!event) return false;
      
      // Also remove all registrations for this event
      await Registration.deleteMany({ eventId: id });
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Add participant to event
  addParticipant: async (eventId, userId) => {
    try {
      const event = await Event.findById(eventId);
      if (!event) return null;
      
      // Check if user is already a participant
      if (!event.participants.includes(userId)) {
        event.participants.push(userId);
        await event.save();
      }
      return event;
    } catch (error) {
      throw error;
    }
  },

  // Remove participant from event
  removeParticipant: async (eventId, userId) => {
    try {
      const event = await Event.findById(eventId);
      if (!event) return null;
      
      event.participants = event.participants.filter(
        id => id.toString() !== userId.toString()
      );
      await event.save();
      return event;
    } catch (error) {
      throw error;
    }
  }
};

// Registration store methods
const registrationStore = {
  // Check if user is registered for event
  isRegistered: async (eventId, userId) => {
    try {
      const registration = await Registration.findOne({
        eventId,
        userId
      });
      return !!registration;
    } catch (error) {
      throw error;
    }
  },

  // Register user for event
  register: async (eventId, userId) => {
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
  },

  // Get all registrations for a user
  getByUser: async (userId) => {
    try {
      return await Registration.find({ userId })
        .populate('eventId', 'title date time description')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  },

  // Get all registrations for an event
  getByEvent: async (eventId) => {
    try {
      return await Registration.find({ eventId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  userStore,
  eventStore,
  registrationStore
};
