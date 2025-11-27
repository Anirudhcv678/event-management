const Event = require('../models/Event');

class EventRepository {
  // Find event by ID
  async findById(id) {
    try {
      return await Event.findById(id).populate('organizerId', 'name email');
    } catch (error) {
      throw error;
    }
  }

  // Get all events
  async getAll() {
    try {
      return await Event.find().populate('organizerId', 'name email').sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get events by organizer
  async getByOrganizer(organizerId) {
    try {
      return await Event.find({ organizerId }).populate('organizerId', 'name email').sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Create new event
  async create(eventData) {
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
  }

  // Update event
  async update(id, eventData) {
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
  }

  // Delete event
  async delete(id) {
    try {
      const event = await Event.findByIdAndDelete(id);
      return !!event;
    } catch (error) {
      throw error;
    }
  }

  // Add participant to event
  async addParticipant(eventId, userId) {
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
  }

  // Remove participant from event
  async removeParticipant(eventId, userId) {
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
}

module.exports = new EventRepository();

