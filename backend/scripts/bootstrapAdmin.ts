import { PrismaClient } from '@prisma/client';
import { PasswordUtil } from '../src/utils/password.js';
import { ROLES } from '../src/constants/roles.js';
import { MODULES } from '../src/constants/modules.js';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function bootstrapSuperAdmin() {
  console.log('--- Asli Cart Super Admin Bootstrap ---');

  const email = env.ADMIN_BOOTSTRAP_EMAIL;
  const password = env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.error('ERROR: ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be configured in .env');
    process.exit(1);
  }

  // Check if an active SUPER_ADMIN already exists in the system
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      isActive: true,
      role: {
        name: ROLES.SUPER_ADMIN,
      },
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  if (existingSuperAdmin) {
    console.log('Bootstrap check: An active Super Admin already exists in the database.');
    console.log(`Existing Super Admin ID: ${existingSuperAdmin.id}`);
    console.log(`Existing Super Admin Email: ${existingSuperAdmin.email}`);
    console.log(`Created At: ${existingSuperAdmin.createdAt.toISOString()}`);
    console.log('Bootstrap has already been completed. Aborting to prevent overwriting existing administrative access.');
    return;
  }

  // Ensure SUPER_ADMIN role exists in the database
  const superAdminRole = await prisma.role.findUnique({
    where: { name: ROLES.SUPER_ADMIN },
  });

  if (!superAdminRole) {
    console.error(`ERROR: The ${ROLES.SUPER_ADMIN} role does not exist. Please run database seeding first: npm run prisma:seed`);
    process.exit(1);
  }

  // Validate password complexity
  const passwordValidation = PasswordUtil.isStrongPassword(password);
  if (!passwordValidation.valid) {
    console.error('ERROR: Weak bootstrap password provided.');
    for (const reason of passwordValidation.reasons) {
      console.error(`  - ${reason}`);
    }
    process.exit(1);
  }

  // Hash password securely
  console.log('Hashing password securely with bcrypt...');
  const passwordHash = await PasswordUtil.hash(password);

  // Check if a user with this email already exists
  const existingUserWithEmail = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  let superAdminUser;
  if (existingUserWithEmail) {
    console.log(`User with email ${email} already exists. Promoting to Super Admin...`);
    superAdminUser = await prisma.user.update({
      where: { id: existingUserWithEmail.id },
      data: {
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
        emailVerified: true,
      },
    });
  } else {
    console.log(`Creating initial Super Admin account for: ${email}`);
    superAdminUser = await prisma.user.create({
      data: {
        fullName: 'Asli Cart Super Admin',
        email: email.toLowerCase(),
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
        emailVerified: true,
      },
    });
  }

  // Record audit log entry
  await prisma.auditLog.create({
    data: {
      actorUserId: superAdminUser.id,
      action: 'admin.bootstrap',
      moduleName: MODULES.AUTH,
      entityId: superAdminUser.id,
      metadata: {
        bootstrapEmail: email.toLowerCase(),
        role: ROLES.SUPER_ADMIN,
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('Super Admin bootstrap succeeded!');
  console.log('Safe account details:');
  console.log(`- ID: ${superAdminUser.id}`);
  console.log(`- Email: ${superAdminUser.email}`);
  console.log(`- Full Name: ${superAdminUser.fullName}`);
  console.log(`- Role: ${ROLES.SUPER_ADMIN}`);
  console.log(`- Active: ${superAdminUser.isActive}`);
  console.log('Credentials and passwords are secure and were not logged.');
}

bootstrapSuperAdmin()
  .catch((err) => {
    console.error('Bootstrap failed with error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

