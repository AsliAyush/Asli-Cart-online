import { PrismaClient } from '@prisma/client';
import { ROLES } from '../src/constants/roles.js';

async function verifySeed() {
  const prisma = new PrismaClient();
  try {
    console.log('--- Verifying Seeded RBAC Data in Neon PostgreSQL ---');

    // 1. Roles
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    console.log(`Roles (${roles.length}):`);
    for (const r of roles) {
      console.log(`  - ${r.name} (isSystem: ${r.isSystem}, id: ${r.id})`);
    }

    const expectedRoles = [ROLES.SUPER_ADMIN, ROLES.PRODUCT_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER, ROLES.CUSTOMER];
    const missingRoles = expectedRoles.filter((er) => !roles.some((r) => r.name === er));
    if (missingRoles.length > 0) {
      throw new Error(`Missing expected roles: ${missingRoles.join(', ')}`);
    }

    // 2. Modules
    const modules = await prisma.module.findMany({ orderBy: { name: 'asc' } });
    console.log(`Modules (${modules.length}):`);
    console.log(`  Names: ${modules.map((m) => m.name).join(', ')}`);

    // 3. Permissions
    const permissionCount = await prisma.modulePermission.count();
    console.log(`Total Module Permissions: ${permissionCount}`);

    // 4. Role Module Permissions
    const rolePermissionCounts = await Promise.all(
      roles.map(async (r) => {
        const count = await prisma.roleModulePermission.count({ where: { roleId: r.id } });
        return { role: r.name, count };
      })
    );
    console.log('Role Permission Assignments:');
    for (const rpc of rolePermissionCounts) {
      console.log(`  - ${rpc.role}: ${rpc.count} permissions assigned`);
    }

    console.log('Seed verification successful!');
    process.exit(0);
  } catch (err: any) {
    console.error('Seed verification failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed();

