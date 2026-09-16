import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/__mocks__/prisma';
import bcrypt from 'bcryptjs';

// Setup bcrypt mock for predictable hashing/comparing in tests
vi.mock('bcryptjs', () => {
  return {
    default: {
      compare: vi.fn(),
      hash: vi.fn(),
    }
  };
});

describe('Auth Module Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario si los datos son correctos', async () => {
      // Setup mocks
      prismaMock.user.findUnique.mockResolvedValue(null); // Email doesn't exist
      
      const mockRole = { id: 'role-123', name: 'USER' as any, description: null, createdAt: new Date(), updatedAt: new Date() };
      prismaMock.role.findUnique.mockResolvedValue(mockRole);

      (bcrypt.hash as any).mockResolvedValue('hashedpassword');

      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'hashedpassword',
        image: null,
        status: 'ACTIVE',
        roleId: 'role-123',
        layoutPrefs: null,
        lastLoginAt: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@gmail.com',
          password: 'Password123!',
        });

      if (response.status !== 201) {
        console.log("Register Response:", response.body);
      }
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe('test@gmail.com');
      // No debe devolver el password
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('debería fallar si el email ya existe', async () => {
      // Simulate user already exists
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'hashedpassword',
        image: null,
        status: 'ACTIVE',
        roleId: 'role-123',
        layoutPrefs: null,
        lastLoginAt: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@gmail.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería hacer login correctamente y retornar un token', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'hashedpassword',
        image: null,
        status: 'ACTIVE' as any,
        roleId: 'role-123',
        layoutPrefs: null,
        lastLoginAt: null,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        role: {
          name: 'USER',
        }
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as any).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'Password123!',
        });

      if (response.status !== 200) {
        console.log("Login Response:", response.body);
      }
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('debería fallar con credenciales inválidas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@gmail.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
