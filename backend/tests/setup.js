import { connectDB, disconnectDB, clearDatabase } from '../src/config/database.js';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/deenverse_test';
  
  // Connect to test database
  await connectDB();
});

// Global test teardown
afterAll(async () => {
  // Clear test database
  await clearDatabase();
  
  // Disconnect from database
  await disconnectDB();
});

// Clear database before each test
beforeEach(async () => {
  await clearDatabase();
});
