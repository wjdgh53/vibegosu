import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL 확인
if (!process.env.DATABASE_URL) {
  console.error('⚠️ DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  console.error('Vercel Dashboard → Settings → Environment Variables에서 DATABASE_URL을 설정하세요.');
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

