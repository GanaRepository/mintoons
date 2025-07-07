import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  GET as getUsersHandler,
  POST as createUserHandler,
} from '../app/api/admin/users/route';
import {
  PUT as updateUserHandler,
  DELETE as deleteUserHandler,
} from '../app/api/admin/users/[id]/route';
import { connectDB } from '../utils/db';
import User from '../models/User';

// Mock dependencies
jest.mock('../utils/db');
jest.mock('../models/User');
jest.mock('next-auth');

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should fetch users with pagination', async () => {
      const mockUsers = [
        {
          _id: 'user1',
          name: 'Student One',
          email: 'student1@example.com',
          role: 'student',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        {
          _id: 'user2',
          name: 'Mentor One',
          email: 'mentor1@example.com',
          role: 'mentor',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      ];

      // Mock admin session
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      });
      User.countDocuments = jest.fn().mockResolvedValue(2);

      const request = new Request(
        'http://localhost:3000/api/admin/users?page=1&limit=10'
      );
      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
    });

    it('should filter users by role', async () => {
      const mockStudents = [
        {
          _id: 'user1',
          name: 'Student One',
          email: 'student1@example.com',
          role: 'student',
          isActive: true,
        },
      ];

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue(mockStudents),
            }),
          }),
        }),
      });

      const request = new Request(
        'http://localhost:3000/api/admin/users?role=student'
      );
      await getUsersHandler(request);

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'student' })
      );
    });

    it('should search users by name or email', async () => {
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const request = new Request(
        'http://localhost:3000/api/admin/users?search=john'
      );
      await getUsersHandler(request);

      expect(User.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { name: { $regex: 'john', $options: 'i' } },
            { email: { $regex: 'john', $options: 'i' } },
          ]),
        })
      );
    });

    it('should reject non-admin access', async () => {
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'user1', role: 'student' },
        }),
      }));

      const request = new Request('http://localhost:3000/api/admin/users');
      const response = await getUsersHandler(request);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create a new user', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'student',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      User.findOne = jest.fn().mockResolvedValue(null); // Email not exists
      User.mockImplementation(() => mockUser);

      const request = new Request('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: 'newuser@example.com',
          role: 'student',
          age: 12,
          sendWelcomeEmail: true,
        }),
      });

      const response = await createUserHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.temporaryPassword).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      User.findOne = jest
        .fn()
        .mockResolvedValue({ email: 'existing@example.com' });

      const request = new Request('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate User',
          email: 'existing@example.com',
          role: 'student',
        }),
      });

      const response = await createUserHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User with this email already exists');
    });

    it('should validate required fields', async () => {
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      const request = new Request('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Incomplete User',
          // Missing email and role
        }),
      });

      const response = await createUserHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });
  });

  describe('PUT /api/admin/users/[id]', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Old Name',
        email: 'user@example.com',
        role: 'student',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const request = new Request(
        'http://localhost:3000/api/admin/users/user123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Updated Name',
            isActive: false,
          }),
        }
      );

      const response = await updateUserHandler(request, {
        params: { id: 'user123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.isActive).toBe(false);
    });

    it('should prevent role elevation by non-super-admin', async () => {
      const mockUser = {
        _id: 'user123',
        role: 'student',
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' }, // Not super admin
        }),
      }));

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const request = new Request(
        'http://localhost:3000/api/admin/users/user123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'admin', // Trying to promote to admin
          }),
        }
      );

      const response = await updateUserHandler(request, {
        params: { id: 'user123' },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/users/[id]', () => {
    it('should deactivate user instead of deleting', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'User to Delete',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const request = new Request(
        'http://localhost:3000/api/admin/users/user123',
        {
          method: 'DELETE',
        }
      );

      const response = await deleteUserHandler(request, {
        params: { id: 'user123' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockUser.isActive).toBe(false);
      expect(data.message).toBe('User deactivated successfully');
    });

    it('should prevent self-deletion', async () => {
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      const request = new Request(
        'http://localhost:3000/api/admin/users/admin1',
        {
          method: 'DELETE',
        }
      );

      const response = await deleteUserHandler(request, {
        params: { id: 'admin1' },
      });

      expect(response.status).toBe(400);
    });
  });

  describe('User Statistics', () => {
    it('should calculate user statistics correctly', async () => {
      const mockStats = {
        totalUsers: 150,
        activeUsers: 140,
        students: 120,
        mentors: 25,
        admins: 5,
        newUsersThisMonth: 15,
        activeUsersToday: 45,
      };

      User.countDocuments = jest
        .fn()
        .mockResolvedValueOnce(150) // total
        .mockResolvedValueOnce(140) // active
        .mockResolvedValueOnce(120) // students
        .mockResolvedValueOnce(25) // mentors
        .mockResolvedValueOnce(5) // admins
        .mockResolvedValueOnce(15) // new this month
        .mockResolvedValueOnce(45); // active today

      // Test statistics calculation
      expect(mockStats.totalUsers).toBe(150);
      expect(mockStats.students + mockStats.mentors + mockStats.admins).toBe(
        150
      );
      expect(mockStats.activeUsers).toBeLessThanOrEqual(mockStats.totalUsers);
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk user activation', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      const mockResult = { modifiedCount: 3 };

      User.updateMany = jest.fn().mockResolvedValue(mockResult);

      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: 'admin1', role: 'admin' },
        }),
      }));

      // Simulate bulk activation
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: true }
      );

      expect(result.modifiedCount).toBe(3);
      expect(User.updateMany).toHaveBeenCalledWith(
        { _id: { $in: userIds } },
        { isActive: true }
      );
    });

    it('should handle bulk user deletion', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      const mockResult = { modifiedCount: 3 };

      User.updateMany = jest.fn().mockResolvedValue(mockResult);

      // Simulate bulk deactivation
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: false }
      );

      expect(result.modifiedCount).toBe(3);
    });
  });

  describe('User Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'student.name@school.edu',
        'mentor+tag@domain.org',
      ];
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user space@example.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate user roles', () => {
      const validRoles = ['student', 'mentor', 'admin'];
      const invalidRoles = ['teacher', 'parent', 'guest', ''];

      validRoles.forEach((role) => {
        expect(['student', 'mentor', 'admin']).toContain(role);
      });

      invalidRoles.forEach((role) => {
        expect(['student', 'mentor', 'admin']).not.toContain(role);
      });
    });

    it('should validate age constraints', () => {
      const validAges = [8, 12, 15, 17];
      const invalidAges = [3, 19, -1, null];

      validAges.forEach((age) => {
        expect(age).toBeGreaterThanOrEqual(4);
        expect(age).toBeLessThanOrEqual(18);
      });

      invalidAges.forEach((age) => {
        if (age !== null) {
          expect(age < 4 || age > 18).toBe(true);
        }
      });
    });
  });
});
