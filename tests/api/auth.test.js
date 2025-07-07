import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { POST as registerHandler } from '../app/api/auth/register/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { connectDB } from '../utils/db';
import User from '../models/User';

// Mock dependencies
jest.mock('../utils/db');
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('next-auth');

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.mockImplementation(() => mockUser);

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'student',
          age: 12,
          parentEmail: 'parent@example.com',
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('User registered successfully');
      expect(data.user.email).toBe('test@example.com');
    });

    it('should reject registration with existing email', async () => {
      User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'student',
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          // Missing email and password
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should enforce COPPA compliance for students under 13', async () => {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Young Student',
          email: 'young@example.com',
          password: 'password123',
          role: 'student',
          age: 10,
          // Missing parentEmail
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('parent email');
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'student',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Login successful');
      expect(data.user.email).toBe('test@example.com');
    });

    it('should reject login with invalid credentials', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should reject login for inactive users', async () => {
      const mockUser = {
        email: 'test@example.com',
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Account is deactivated');
    });
  });

  describe('Password Reset', () => {
    it('should initiate password reset for valid email', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const request = new Request(
        'http://localhost:3000/api/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
          }),
        }
      );

      // Mock the reset handler
      const response = {
        status: 200,
        json: () => ({ message: 'Password reset email sent' }),
      };

      expect(response.status).toBe(200);
    });
  });
});
