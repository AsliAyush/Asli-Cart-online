import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing connection to Neon PostgreSQL...');
    const result = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
    console.log('Database connection successful. Result:', result);
    process.exit(0);
  } catch (err: any) {
    // Sanitize connection strings so credentials are never printed
    const sanitized = err.message
      ? err.message.replace(/postgresql:\/\/[^@]+@/g, 'postgresql://[REDACTED_CREDENTIALS]@')
      : String(err);
    console.error('Database connection failed:', sanitized);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

