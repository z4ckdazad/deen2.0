import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/User.js';
import { connectDB, disconnectDB } from '../src/config/database.js';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        fullName: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'student',
        islamicProfile: 'student',
        bio: 'I am passionate about learning Islamic knowledge'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.fullName).toBe(userData.fullName);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        fullName: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'student',
        islamicProfile: 'student'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should validate required fields', async () => {
      const userData = {
        fullName: 'Ahmed Hassan',
        // Missing email, password, role, islamicProfile
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    it('should validate email format', async () => {
      const userData = {
        fullName: 'Ahmed Hassan',
        email: 'invalid-email',
        password: 'password123',
        role: 'student',
        islamicProfile: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate password length', async () => {
      const userData = {
        fullName: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: '123', // Too short
        role: 'student',
        islamicProfile: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        fullName: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'student',
        islamicProfile: 'student'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'ahmed@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'ahmed@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Create a test user and get refresh token
      const userData = {
        fullName: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'student',
        islamicProfile: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      refreshToken = response.body.data.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should not refresh token with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should require refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    let token;

    beforeEach(async () => {
      // Create a test user and get token
      const userData = {
        fullName: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'student',
        islamicProfile: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      token = response.body.data.token;
    });

    it('should logout user with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should not logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });
});
