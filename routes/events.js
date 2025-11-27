const express = require('express');
const { authenticate, requireOrganizer } = require('../middleware/auth');
const eventController = require('../controllers/eventController');

const router = express.Router();

// GET /events - Get all events (requires authentication)
router.get('/', authenticate, (req, res) => eventController.getAllEvents(req, res));

// GET /events/:id - Get event by ID (requires authentication)
router.get('/:id', authenticate, (req, res) => eventController.getEventById(req, res));

// POST /events - Create new event (organizers only)
router.post('/', authenticate, requireOrganizer, (req, res) => eventController.createEvent(req, res));

// PUT /events/:id - Update event (organizers only, and only their own events)
router.put('/:id', authenticate, requireOrganizer, (req, res) => eventController.updateEvent(req, res));

// DELETE /events/:id - Delete event (organizers only, and only their own events)
router.delete('/:id', authenticate, requireOrganizer, (req, res) => eventController.deleteEvent(req, res));

// POST /events/:id/register - Register for an event (requires authentication)
router.post('/:id/register', authenticate, (req, res) => eventController.registerForEvent(req, res));

// GET /events/:id/registrations - Get event registrations (organizer only)
router.get('/:id/registrations', authenticate, requireOrganizer, (req, res) => eventController.getEventRegistrations(req, res));

module.exports = router;
