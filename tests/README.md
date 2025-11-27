# Test Suite Documentation

This directory contains comprehensive test cases for the Event Management Platform.

## Test Structure

```
tests/
├── setup.js                          # Test database setup and teardown
├── repositories/
│   ├── userRepository.test.js       # User repository tests
│   ├── eventRepository.test.js      # Event repository tests
│   └── registrationRepository.test.js # Registration repository tests
├── services/
│   ├── authService.test.js          # Authentication service tests
│   └── eventService.test.js        # Event service tests
├── controllers/
│   └── authController.test.js       # Authentication controller tests
├── middleware/
│   └── auth.test.js                 # Authentication middleware tests
├── routes/
│   └── auth.test.js                 # Route tests
└── integration/
    └── eventFlow.test.js            # End-to-end integration tests
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run specific test file:
```bash
npx jest tests/repositories/userRepository.test.js
```

### Run tests with coverage:
```bash
npm test -- --coverage
```

## Test Database

Tests use a separate MongoDB database (`event-management-test`) to avoid affecting development data.

### Setup Test Database

1. Make sure MongoDB is running locally, OR
2. Set `TEST_MONGODB_URI` in your environment:
   ```env
   TEST_MONGODB_URI=mongodb://localhost:27017/event-management-test
   ```

The test setup automatically:
- Connects to the test database before all tests
- Cleans up data after each test
- Drops the test database after all tests complete

## Test Coverage

The test suite covers:

### Repository Layer (Data Access)
- ✅ User CRUD operations
- ✅ Event CRUD operations
- ✅ Registration operations
- ✅ Database queries and relationships
- ✅ Error handling

### Service Layer (Business Logic)
- ✅ User registration and authentication
- ✅ Event creation and management
- ✅ Event registration flow
- ✅ Authorization checks
- ✅ Business rule validation

### Controller Layer (Request/Response)
- ✅ Request validation
- ✅ Response formatting
- ✅ Error handling
- ✅ HTTP status codes

### Middleware
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Token validation

### Integration Tests
- ✅ Complete user flows
- ✅ Event CRUD operations
- ✅ Registration workflow
- ✅ Authorization enforcement

## Writing New Tests

### Repository Test Example:
```javascript
const repository = require('../../repositories/userRepository');
require('../setup');

describe('UserRepository', () => {
  it('should create a new user', async () => {
    const user = await repository.create({
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test User'
    });
    
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

### Service Test Example:
```javascript
const service = require('../../services/authService');
require('../setup');

describe('AuthService', () => {
  it('should register user', async () => {
    const result = await service.register(
      'test@example.com',
      'password123',
      'Test User'
    );
    
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Tests automatically clean up after each run
3. **Mocking**: Use mocks for external dependencies (email service, etc.)
4. **Descriptive Names**: Use clear test descriptions
5. **Arrange-Act-Assert**: Follow AAA pattern in tests

## Troubleshooting

### Tests failing with database connection errors:
- Ensure MongoDB is running
- Check `TEST_MONGODB_URI` environment variable
- Verify database permissions

### Tests leaving data in database:
- Tests should automatically clean up, but you can manually drop the test database:
  ```bash
  mongo event-management-test --eval "db.dropDatabase()"
  ```

### Port conflicts:
- Integration tests use the Express app but don't start a server
- If you see port errors, check for other running instances

