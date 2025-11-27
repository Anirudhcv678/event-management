require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/user');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/register', authRoutes);
app.use('/login', authRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Event Management API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /register': 'Register a new user',
        'POST /login': 'Login user'
      },
      events: {
        'GET /events': 'Get all events (requires authentication)',
        'GET /events/:id': 'Get event by ID (requires authentication)',
        'POST /events': 'Create new event (requires organizer role)',
        'PUT /events/:id': 'Update event (requires organizer role, own events only)',
        'DELETE /events/:id': 'Delete event (requires organizer role, own events only)',
        'POST /events/:id/register': 'Register for an event (requires authentication)',
        'GET /events/:id/registrations': 'Get event registrations (requires organizer role, own events only)'
      },
      user: {
        'GET /user/profile': 'Get current user profile (requires authentication)',
        'GET /user/registrations': 'Get user event registrations (requires authentication)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Event Management Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/\n`);
  
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  MongoDB URI not configured. Using default: mongodb://localhost:27017/event-management');
    console.log('   To use a custom MongoDB connection, set MONGODB_URI in .env file\n');
  }
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email service not configured. Email notifications will be logged to console.');
    console.log('   To enable email, set EMAIL_USER and EMAIL_PASS in .env file\n');
  }
});

module.exports = app;

