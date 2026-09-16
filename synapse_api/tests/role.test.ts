import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/__mocks__/prisma';
import jwt from 'jsonwebtoken';

describe('Role Module Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería permitir consultar y crear roles en la base de datos', async () => {
    const mockRole = {
      id: 'role-999',
      name: 'ADMIN' as any,
      description: 'Administrador de contenidos',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.role.upsert.mockResolvedValue(mockRole as any);

    const token = jwt.sign(
      { id: 'admin-123', email: 'admin@sena.edu.co', role: 'SUPER_ADMIN' },
      process.env.JWT_SECRET || 'default_dev_secret_for_synapse'
    );

    const response = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'ADMIN',
        description: 'Administrador de contenidos',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('ADMIN');
  });
});
