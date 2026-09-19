import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prismaMock } from '../src/__mocks__/prisma';
import jwt from 'jsonwebtoken';
import { AllowedDomainService } from '../src/modules/allowed-domain/allowed-domain.service';

describe('Allowed Domain Module Integration & Unit Tests', () => {
  const superAdminToken = jwt.sign(
    { id: 'superadmin-1', email: 'super@sena.edu.co', role: 'SUPER_ADMIN' },
    process.env.JWT_SECRET || 'default_dev_secret_for_synapse'
  );

  const userToken = jwt.sign(
    { id: 'user-1', email: 'aprendiz@soy.sena.edu.co', role: 'USER' },
    process.env.JWT_SECRET || 'default_dev_secret_for_synapse'
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/allowed-domains', () => {
    it('debería bloquear acceso a usuarios no super-admin', async () => {
      const res = await request(app)
        .get('/api/allowed-domains')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('debería listar dominios para super-admin', async () => {
      const mockDomains = [
        { id: 'd1', domain: 'soy.sena.edu.co', scope: 'ALL', isActive: true, description: 'SENA', createdAt: new Date(), updatedAt: new Date() }
      ];
      (prismaMock as any).allowedDomain = {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue(mockDomains),
      };

      const res = await request(app)
        .get('/api/allowed-domains')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].domain).toBe('soy.sena.edu.co');
    });
  });

  describe('AllowedDomainService.isDomainAllowed logic', () => {
    it('debe permitir dominios ALL tanto para USER como para ADMIN', async () => {
      (prismaMock as any).allowedDomain = {
        findFirst: vi.fn().mockResolvedValue({
          id: 'd1',
          domain: 'soy.sena.edu.co',
          scope: 'ALL',
          isActive: true,
        }),
      };

      const checkUser = await AllowedDomainService.isDomainAllowed('test@soy.sena.edu.co', 'USER');
      expect(checkUser.allowed).toBe(true);

      const checkAdmin = await AllowedDomainService.isDomainAllowed('test@soy.sena.edu.co', 'ADMIN');
      expect(checkAdmin.allowed).toBe(true);
    });

    it('debe rechazar dominios ADMIN cuando se intentan usar por USER', async () => {
      (prismaMock as any).allowedDomain = {
        findFirst: vi.fn().mockResolvedValue({
          id: 'd2',
          domain: 'gmail.com',
          scope: 'ADMIN',
          isActive: true,
        }),
      };

      const checkUser = await AllowedDomainService.isDomainAllowed('pepito@gmail.com', 'USER');
      expect(checkUser.allowed).toBe(false);
      expect(checkUser.error).toContain('ADMIN');
    });

    it('debe rechazar dominios no registrados', async () => {
      (prismaMock as any).allowedDomain = {
        findFirst: vi.fn().mockResolvedValue(null),
      };

      const checkUnknown = await AllowedDomainService.isDomainAllowed('attacker@phishing.net', 'USER');
      expect(checkUnknown.allowed).toBe(false);
    });
  });
});
