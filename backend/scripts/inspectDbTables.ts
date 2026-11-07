import { PrismaClient } from '@prisma/client';

async function inspectDbTables() {
  const prisma = new PrismaClient();
  try {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    console.log(`Found ${tables.length} tables in public schema:`);
    for (const t of tables) {
      console.log(` - ${t.table_name}`);
    }
  } catch (err: any) {
    console.error('Failed to inspect tables:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDbTables();

