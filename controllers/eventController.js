const eventService = require('../services/eventService');

class EventController {
  async getAllEvents(req, res) {
    try {
      const events = await eventService.getAllEvents();
      
      // Format response
      const eventsWithDetails = events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        organizerId: event.organizerId._id || event.organizerId,
        organizerName: event.organizerId.name || 'Unknown',
        participantCount: event.participants.length,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }));

      res.json({
        success: true,
        data: eventsWithDetails
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching events',
        error: error.message
      });
    }
  }

  async getEventById(req, res) {
    try {
      const event = await eventService.getEventById(req.params.id);

      res.json({
        success: true,
        data: {
          id: event._id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          organizerId: event.organizerId._id || event.organizerId,
          organizerName: event.organizerId.name || 'Unknown',
          organizerEmail: event.organizerId.email || 'Unknown',
          participantCount: event.participants.length,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt
        }
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching event',
        error: error.message
      });
    }
  }

  async createEvent(req, res) {
    try {
      const { title, description, date, time } = req.body;

      const event = await eventService.createEvent(
        title,
        description,
        date,
        time,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      console.error('Error creating event:', error);
      
      if (error.message === 'Title, date, and time are required') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating event',
        error: error.message
      });
    }
  }

  async updateEvent(req, res) {
    try {
      const { title, description, date, time } = req.body;
      const updateData = {};
      
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = date;
      if (time !== undefined) updateData.time = time;

      const updatedEvent = await eventService.updateEvent(
        req.params.id,
        updateData,
        req.user.id
      );
      
      res.json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'You can only update your own events') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating event',
        error: error.message
      });
    }
  }

  async deleteEvent(req, res) {
    try {
      const deleted = await eventService.deleteEvent(req.params.id, req.user.id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Event deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error deleting event'
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'You can only delete your own events') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error deleting event',
        error: error.message
      });
    }
  }

  async registerForEvent(req, res) {
    try {
      const result = await eventService.registerForEvent(
        req.params.id,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Successfully registered for event. Confirmation email sent.',
        data: result
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'You are already registered for this event') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error registering for event',
        error: error.message
      });
    }
  }

  async getEventRegistrations(req, res) {
    try {
      const registrations = await eventService.getEventRegistrations(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'You can only view registrations for your own events') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching registrations',
        error: error.message
      });
    }
  }
}

module.exports = new EventController();

