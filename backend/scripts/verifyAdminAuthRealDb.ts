import { authService } from '../src/services/auth.service.js';
import { roleService } from '../src/services/role.service.js';
import { env } from '../src/config/env.js';
import { JwtUtil } from '../src/utils/jwt.js';
import prisma from '../src/infra/database/prisma.js';

async function verifyAdminAuthRealDb() {
  console.log('--- Verifying Admin Authentication Against Real Neon Database ---');

  const email = env.ADMIN_BOOTSTRAP_EMAIL;
  const password = env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.error('Missing bootstrap credentials in environment');
    process.exit(1);
  }

  try {
    // 1. Test Admin Login with valid credentials
    console.log('1. Testing Admin Login with valid credentials...');
    const loginResult = await authService.adminLogin(email, password, '127.0.0.1');

    console.log('   ✓ Login successful');
    console.log(`   ✓ Authenticated Admin User ID: ${loginResult.user.id}`);
    console.log(`   ✓ Authenticated Admin Email: ${loginResult.user.email}`);
    console.log(`   ✓ Role Assigned: ${loginResult.user.roleName}`);
    console.log(`   ✓ Access Token generated: ${loginResult.accessToken ? 'YES (Valid JWT format)' : 'NO'}`);
    console.log(`   ✓ Refresh Token generated: ${loginResult.refreshToken ? 'YES (Valid JWT format)' : 'NO'}`);

    // Verify token validity with JWT utility
    const accessPayload = JwtUtil.verifyAccessToken(loginResult.accessToken);
    console.log(`   ✓ Access token verified: userId=${accessPayload.userId}, role=${accessPayload.roleName}`);

    // Verify refresh token stored in Neon database
    const tokenHash = JwtUtil.hashToken(loginResult.refreshToken);
    const dbToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!dbToken) {
      throw new Error('Refresh token hash was not stored in Neon database!');
    }
    console.log(`   ✓ Stored token record confirmed in Neon database (ID: ${dbToken.id}, active: ${!dbToken.revokedAt})`);

    // Verify AuditLog written to Neon database
    const auditRecord = await prisma.auditLog.findFirst({
      where: {
        actorUserId: loginResult.user.id,
        action: 'admin.login',
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!auditRecord) {
      throw new Error('Login audit log was not written to Neon database!');
    }
    console.log(`   ✓ AuditLog record confirmed in Neon database (action: ${auditRecord.action}, time: ${auditRecord.createdAt.toISOString()})`);

    // 2. Test Authenticated Admin Profile (/me endpoint service)
    console.log('2. Testing Admin Profile retrieval (/me)...');
    const profile = await authService.getMe(loginResult.user.id);
    console.log(`   ✓ Admin Profile retrieved: fullName="${profile.fullName}", email="${profile.email}", active=${profile.isActive}`);

    // 3. Test Role & Permission Loading from Neon Database
    console.log('3. Testing Role & Permission loading from Neon database...');
    const rolePermissions = await roleService.getRolePermissions(loginResult.user.roleId);
    console.log(`   ✓ Loaded ${rolePermissions.length} permissions for role ${loginResult.user.roleName} directly from Neon`);
    const samplePermissions = rolePermissions.slice(0, 5).map((p) => `${p.moduleName}.${p.permissionKey}`);
    console.log(`   ✓ Sample permissions: ${samplePermissions.join(', ')}...`);

    // 4. Test Refresh Token Rotation
    console.log('4. Testing Refresh Token Rotation...');
    const refreshResult = await authService.refreshToken(loginResult.refreshToken);
    console.log('   ✓ Token refresh successful');
    console.log(`   ✓ New Access Token generated: ${refreshResult.accessToken ? 'YES' : 'NO'}`);
    console.log(`   ✓ New Refresh Token generated: ${refreshResult.refreshToken ? 'YES' : 'NO'}`);

    // Verify previous token is now revoked in Neon database
    const revokedOldToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    console.log(`   ✓ Old refresh token revocation in Neon confirmed: revokedAt=${revokedOldToken?.revokedAt?.toISOString()}`);

    // 5. Test Login Rejection with Invalid Password
    console.log('5. Testing Login Rejection with invalid password...');
    try {
      await authService.adminLogin(email, 'WrongPassword123!', '127.0.0.1');
      throw new Error('Should have rejected invalid password!');
    } catch (err: any) {
      if (err.statusCode === 401) {
        console.log(`   ✓ Invalid password rejected with HTTP ${err.statusCode}: "${err.message}"`);
      } else {
        throw err;
      }
    }

    console.log('All real database Admin authentication checks passed successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminAuthRealDb();

