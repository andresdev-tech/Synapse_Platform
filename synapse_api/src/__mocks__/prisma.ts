import { PrismaClient } from '../../generated/prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { prisma } from '../config/prisma';
import { beforeEach, vi } from 'vitest';

vi.mock('../config/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
  RoleNames: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    AUTHOR: 'AUTHOR',
    USER: 'USER',
  }
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
