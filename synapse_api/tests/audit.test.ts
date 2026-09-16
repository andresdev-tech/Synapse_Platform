import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/__mocks__/prisma';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  }
}));

describe('Session and AuditLog Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería guardar la sesión y generar AuditLog al hacer login', async () => {
    const mockUser = {
      id: 'user-777',
      name: 'Audit User',
      email: 'audit@gmail.com',
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
    prismaMock.session.create.mockResolvedValue({
      id: 'session-123',
      sessionToken: 'mock-token',
      userId: 'user-777',
      expires: new Date(Date.now() + 86400000),
    } as any);

    prismaMock.auditLog.create.mockResolvedValue({
      id: 'audit-123',
      actorId: 'user-777',
      action: 'LOGIN' as any,
      entity: 'Session',
      entityId: 'session-123',
      metadata: {},
      createdAt: new Date(),
    } as any);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'audit@gmail.com',
        password: 'Password123!',
      });

    expect(response.status).toBe(200);
    expect(prismaMock.session.create).toHaveBeenCalled();
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });
});
