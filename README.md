# Event Management Platform

A comprehensive backend system for a virtual event management platform built with Node.js and Express.js. The system features secure user authentication, event scheduling, and participant management using MongoDB for persistent data storage.

## Features

- **User Authentication**: Secure registration and login with bcrypt password hashing and JWT token-based authentication
- **Role-Based Access Control**: Distinguishes between event organizers and attendees
- **Event Management**: Full CRUD operations for events (Create, Read, Update, Delete)
- **Event Registration**: Users can register for events with automatic email notifications
- **RESTful API**: Clean, well-structured REST endpoints
- **MongoDB Database**: Persistent data storage with Mongoose ODM
- **Email Notifications**: Automatic confirmation emails on event registration
- **Layered Architecture**: Clean separation of concerns with Routes → Controllers → Services → Repositories pattern

## Tech Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **nodemailer**: Email notifications
- **mongoose**: MongoDB ODM (Object Data Modeling)
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing

## Project Structure

```
event-management/
├── config/
│   └── database.js        # MongoDB connection configuration
├── controllers/
│   ├── authController.js   # Authentication controller (request/response handling)
│   ├── eventController.js # Event management controller
│   └── userController.js  # User profile controller
├── services/
│   ├── authService.js     # Authentication business logic
│   ├── eventService.js    # Event management business logic
│   └── userService.js    # User profile business logic
├── repositories/
│   ├── userRepository.js  # User data access layer (DAO)
│   ├── eventRepository.js # Event data access layer (DAO)
│   └── registrationRepository.js # Registration data access layer (DAO)
├── models/
│   ├── User.js            # User model (Mongoose schema)
│   ├── Event.js           # Event model (Mongoose schema)
│   └── Registration.js    # Registration model (Mongoose schema)
├── middleware/
│   └── auth.js            # Authentication and authorization middleware
├── routes/
│   ├── auth.js            # Authentication routes (HTTP handling only)
│   ├── events.js          # Event management routes
│   └── user.js            # User profile routes
├── utils/
│   └── emailService.js    # Email notification service
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event-management
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/event-management
# For MongoDB Atlas (cloud), use: mongodb+srv://username:password@cluster.mongodb.net/event-management

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@eventmanagement.com
```

**Note**: For email functionality, you'll need to:
- Use Gmail: Enable 2-factor authentication and create an App Password
- Or configure with any SMTP server of your choice

If email credentials are not provided, the system will log email notifications to the console instead.

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Authentication

#### POST /register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "attendee"  // Optional: "attendee" or "organizer" (default: "attendee")
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "attendee",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "attendee"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Events

All event endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

#### GET /events
Get all events (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Tech Conference 2024",
      "description": "Annual technology conference",
      "date": "2024-06-15",
      "time": "09:00",
      "organizerId": 2,
      "participantCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /events/:id
Get a specific event by ID (requires authentication).

#### POST /events
Create a new event (requires organizer role).

**Request Body:**
```json
{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "date": "2024-06-15",
  "time": "09:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 1,
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "date": "2024-06-15",
    "time": "09:00",
    "organizerId": 2,
    "participants": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /events/:id
Update an event (requires organizer role, can only update own events).

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "date": "2024-06-20",
  "time": "10:00"
}
```

#### DELETE /events/:id
Delete an event (requires organizer role, can only delete own events).

#### POST /events/:id/register
Register for an event (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for event. Confirmation email sent.",
  "data": {
    "eventId": 1,
    "eventTitle": "Tech Conference 2024",
    "registeredAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /events/:id/registrations
Get all registrations for an event (requires organizer role, own events only).

### User

#### GET /user/profile
Get current user profile (requires authentication).

#### GET /user/registrations
Get all events the current user is registered for (requires authentication).

## Usage Examples

### 1. Register a New User (Organizer)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "password123",
    "name": "Event Organizer",
    "role": "organizer"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "password123"
  }'
```

### 3. Create an Event (as Organizer)
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Web Development Workshop",
    "description": "Learn modern web development",
    "date": "2024-07-01",
    "time": "14:00"
  }'
```

### 4. Register for an Event (as Attendee)
```bash
curl -X POST http://localhost:3000/events/1/register \
  -H "Authorization: Bearer <your-token>"
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **Role-Based Authorization**: Organizers can only manage their own events
- **Input Validation**: Request validation for required fields
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## Data Storage

The system uses **MongoDB** for persistent data storage. This means:
- Data persists across server restarts
- Scalable and production-ready
- Uses Mongoose ODM for easy data modeling
- Supports relationships between collections

### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB on your system: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/event-management`

**Option 2: MongoDB Atlas (Cloud)**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get your connection string
3. Update `MONGODB_URI` in `.env` file

The system will automatically connect to MongoDB on server startup.

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (duplicate registration, etc.)
- `500`: Internal Server Error

## Architecture

The project follows a **layered architecture** pattern for clean separation of concerns:

1. **Routes Layer** (`routes/`): Handles HTTP requests and responses only
   - Validates request structure
   - Delegates to controllers
   - Returns HTTP responses

2. **Controllers Layer** (`controllers/`): Handles request/response logic
   - Extracts data from requests
   - Calls appropriate services
   - Formats and returns responses
   - Handles HTTP status codes

3. **Services Layer** (`services/`): Contains business logic
   - Implements business rules and validations
   - Orchestrates multiple repository calls
   - Handles complex business operations
   - Throws business-specific errors

4. **Repositories Layer** (`repositories/`): Data access layer (DAO)
   - Direct database operations
   - Uses Mongoose models
   - Abstracts database implementation
   - Returns domain objects

5. **Models Layer** (`models/`): Data models
   - Mongoose schemas
   - Data validation rules
   - Relationships between entities

### Benefits of This Architecture

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to unit test each layer independently
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to add new features or change implementations
- **Reusability**: Services and repositories can be reused across controllers

## Testing

The project includes comprehensive test coverage for all layers of the application.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm test -- --coverage
```

### Test Structure

- **Repository Tests**: Test database operations and data access layer
- **Service Tests**: Test business logic and validation
- **Controller Tests**: Test request/response handling
- **Middleware Tests**: Test authentication and authorization
- **Integration Tests**: Test complete user flows end-to-end

See `tests/README.md` for detailed testing documentation.

## Development

### Extending Functionality

- Add event categories/tags
- Implement event search and filtering
- Add event capacity limits
- Implement waitlist functionality
- Add event reminders
- Implement user preferences

## License

ISC

## Author

Event Management Platform - Backend System
