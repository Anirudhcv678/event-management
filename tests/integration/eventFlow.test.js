const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const userRepository = require('../../repositories/userRepository');
const eventRepository = require('../../repositories/eventRepository');
require('../setup');

// Create test app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('../../routes/auth');
const eventRoutes = require('../../routes/events');
const userRoutes = require('../../routes/user');

app.use('/register', authRoutes);
app.use('/login', authRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);

describe('Event Management Integration Tests', () => {
  let organizerToken;
  let attendeeToken;
  let organizerId;
  let attendeeId;
  let eventId;

  beforeAll(async () => {
    // Register organizer
    const organizerRes = await request(app)
      .post('/register')
      .send({
        email: 'org@test.com',
        password: 'password123',
        name: 'Organizer',
        role: 'organizer'
      });
    organizerToken = organizerRes.body.data.token;
    organizerId = organizerRes.body.data.user.id;

    // Register attendee
    const attendeeRes = await request(app)
      .post('/register')
      .send({
        email: 'attendee@test.com',
        password: 'password123',
        name: 'Attendee'
      });
    attendeeToken = attendeeRes.body.data.token;
    attendeeId = attendeeRes.body.data.user.id;
  });

  describe('Event CRUD Flow', () => {
    it('should create, read, update, and delete an event', async () => {
      // Create event
      const createRes = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Integration Test Event',
          description: 'Test Description',
          date: '2024-12-31',
          time: '10:00'
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      eventId = createRes.body.data._id;

      // Get event
      const getRes = await request(app)
        .get(`/events/${eventId}`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.title).toBe('Integration Test Event');

      // Update event
      const updateRes = await request(app)
        .put(`/events/${eventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Updated Event Title'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe('Updated Event Title');

      // Delete event
      const deleteRes = await request(app)
        .delete(`/events/${eventId}`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe('Event Registration Flow', () => {
    let testEventId;

    beforeEach(async () => {
      // Create event for registration tests
      const createRes = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Registration Test Event',
          date: '2024-12-31',
          time: '10:00'
        });
      testEventId = createRes.body.data._id;
    });

    it('should register attendee for event', async () => {
      const registerRes = await request(app)
        .post(`/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.message).toContain('Confirmation email sent');
    });

    it('should prevent duplicate registration', async () => {
      await request(app)
        .post(`/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      const duplicateRes = await request(app)
        .post(`/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.message).toContain('already registered');
    });

    it('should get user registrations', async () => {
      await request(app)
        .post(`/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${attendeeToken}`);

      const registrationsRes = await request(app)
        .get('/user/registrations')
        .set('Authorization', `Bearer ${attendeeToken}`);

      expect(registrationsRes.status).toBe(200);
      expect(registrationsRes.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent attendee from creating events', async () => {
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          title: 'Unauthorized Event',
          date: '2024-12-31',
          time: '10:00'
        });

      expect(res.status).toBe(403);
    });

    it('should prevent attendee from updating events', async () => {
      const createRes = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Protected Event',
          date: '2024-12-31',
          time: '10:00'
        });
      const protectedEventId = createRes.body.data._id;

      const res = await request(app)
        .put(`/events/${protectedEventId}`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          title: 'Hacked Title'
        });

      expect(res.status).toBe(403);
    });
  });
});

