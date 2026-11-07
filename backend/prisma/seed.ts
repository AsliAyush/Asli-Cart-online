import { PrismaClient } from '@prisma/client';
import { ROLES } from '../src/constants/roles.js';
import { MODULES, PERMISSIONS } from '../src/constants/modules.js';

const prisma = new PrismaClient();

const MODULE_DEFINITIONS: Array<{
  name: string;
  description: string;
  permissions: Array<{ key: string; name: string; description: string }>;
}> = [
  {
    name: MODULES.AUTH,
    description: 'Authentication and authorization',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Auth', description: 'View authentication details' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Auth', description: 'Manage authentication tokens and sessions' },
    ],
  },
  {
    name: MODULES.USER,
    description: 'User and employee management',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Users', description: 'View user accounts' },
      { key: PERMISSIONS.CREATE, name: 'Create Users', description: 'Create employee accounts' },
      { key: PERMISSIONS.UPDATE, name: 'Update Users', description: 'Update user profiles' },
      { key: PERMISSIONS.DELETE, name: 'Delete Users', description: 'Deactivate or delete users' },
      { key: PERMISSIONS.ASSIGN, name: 'Assign Roles', description: 'Assign roles to users' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Users', description: 'Full user administration' },
    ],
  },
  {
    name: MODULES.ROLE,
    description: 'Role and access level management',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Roles', description: 'View roles' },
      { key: PERMISSIONS.CREATE, name: 'Create Roles', description: 'Create custom roles' },
      { key: PERMISSIONS.UPDATE, name: 'Update Roles', description: 'Update role details' },
      { key: PERMISSIONS.DELETE, name: 'Delete Roles', description: 'Delete non-system roles' },
      { key: PERMISSIONS.ASSIGN, name: 'Assign Permissions', description: 'Assign permissions to roles' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Roles', description: 'Full role administration' },
    ],
  },
  {
    name: MODULES.MODULE,
    description: 'Application modules registry',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Modules', description: 'View registered modules' },
      { key: PERMISSIONS.UPDATE, name: 'Update Modules', description: 'Update module settings' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Modules', description: 'Full module administration' },
    ],
  },
  {
    name: MODULES.MODULE_PERMISSION,
    description: 'Permissions catalogue',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Permissions', description: 'View permission catalogue' },
      { key: PERMISSIONS.ASSIGN, name: 'Assign Permissions', description: 'Assign module permissions' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Permissions', description: 'Full permission administration' },
    ],
  },
  {
    name: MODULES.DASHBOARD,
    description: 'Analytics and overview dashboards',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Dashboard', description: 'View dashboard overview' },
    ],
  },
  {
    name: MODULES.PRODUCT,
    description: 'Product catalogue and details',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Products', description: 'View product listings' },
      { key: PERMISSIONS.CREATE, name: 'Create Products', description: 'Create new products' },
      { key: PERMISSIONS.UPDATE, name: 'Update Products', description: 'Update product information' },
      { key: PERMISSIONS.DELETE, name: 'Delete Products', description: 'Delete products' },
      { key: PERMISSIONS.APPROVE, name: 'Approve Products', description: 'Approve submitted products' },
      { key: PERMISSIONS.REJECT, name: 'Reject Products', description: 'Reject product submissions' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Products', description: 'Full product catalogue management' },
    ],
  },
  {
    name: MODULES.PRODUCT_DISCOVERY,
    description: 'Automated deal discovery and scraper integrations',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Discovery', description: 'View discovered products' },
      { key: PERMISSIONS.CREATE, name: 'Trigger Discovery', description: 'Initiate deal discovery runs' },
      { key: PERMISSIONS.UPDATE, name: 'Update Discovery', description: 'Update discovery rules' },
      { key: PERMISSIONS.DELETE, name: 'Delete Discovered', description: 'Discard discovered items' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Discovery', description: 'Full discovery engine administration' },
    ],
  },
  {
    name: MODULES.PRICING,
    description: 'Price history and price drop tracking',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Pricing', description: 'View price histories' },
      { key: PERMISSIONS.CREATE, name: 'Set Pricing', description: 'Set benchmark prices' },
      { key: PERMISSIONS.UPDATE, name: 'Update Pricing', description: 'Update price thresholds' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Pricing', description: 'Full pricing module management' },
    ],
  },
  {
    name: MODULES.OFFER,
    description: 'Promotional deals, discounts, and coupons',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Offers', description: 'View deals and offers' },
      { key: PERMISSIONS.CREATE, name: 'Create Offers', description: 'Create offers' },
      { key: PERMISSIONS.UPDATE, name: 'Update Offers', description: 'Update offers' },
      { key: PERMISSIONS.DELETE, name: 'Delete Offers', description: 'Delete offers' },
      { key: PERMISSIONS.APPROVE, name: 'Approve Offers', description: 'Approve offers for publishing' },
      { key: PERMISSIONS.REJECT, name: 'Reject Offers', description: 'Reject submitted offers' },
      { key: PERMISSIONS.PUBLISH, name: 'Publish Offers', description: 'Publish deals live' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Offers', description: 'Full deals management' },
    ],
  },
  {
    name: MODULES.AFFILIATE,
    description: 'Affiliate network links, subIds and commission attribution',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Affiliates', description: 'View affiliate networks and links' },
      { key: PERMISSIONS.CREATE, name: 'Create Affiliate Link', description: 'Generate affiliate tracking links' },
      { key: PERMISSIONS.UPDATE, name: 'Update Affiliate', description: 'Configure network keys' },
      { key: PERMISSIONS.DELETE, name: 'Delete Affiliate', description: 'Remove affiliate entries' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Affiliates', description: 'Full affiliate administration' },
    ],
  },
  {
    name: MODULES.CONTENT,
    description: 'Marketing creatives, posts, captions, and copy',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Content', description: 'View marketing content' },
      { key: PERMISSIONS.CREATE, name: 'Create Content', description: 'Create posts and creatives' },
      { key: PERMISSIONS.UPDATE, name: 'Update Content', description: 'Edit content drafts' },
      { key: PERMISSIONS.DELETE, name: 'Delete Content', description: 'Delete marketing content' },
      { key: PERMISSIONS.PUBLISH, name: 'Publish Content', description: 'Publish content to social channels' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Content', description: 'Full content pipeline administration' },
    ],
  },
  {
    name: MODULES.SOCIAL_ACCOUNT,
    description: 'Connected social media handles (Telegram, WhatsApp, Instagram, etc.)',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Social Accounts', description: 'View linked social channels' },
      { key: PERMISSIONS.CREATE, name: 'Connect Social Account', description: 'Link new channels' },
      { key: PERMISSIONS.UPDATE, name: 'Update Social Account', description: 'Update credentials' },
      { key: PERMISSIONS.DELETE, name: 'Disconnect Social Account', description: 'Remove channels' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Social Accounts', description: 'Full social channels management' },
    ],
  },
  {
    name: MODULES.PUBLISHING,
    description: 'Automated and scheduled broadcast publishing',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Publishing Queue', description: 'View publishing schedule' },
      { key: PERMISSIONS.CREATE, name: 'Schedule Publish', description: 'Queue a broadcast' },
      { key: PERMISSIONS.UPDATE, name: 'Update Schedule', description: 'Reschedule posts' },
      { key: PERMISSIONS.PUBLISH, name: 'Publish Immediately', description: 'Instant broadcast' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Publishing', description: 'Full publishing administration' },
    ],
  },
  {
    name: MODULES.ANALYTICS,
    description: 'Clicks, revenue, conversion and engagement metrics',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Analytics', description: 'View analytics reports' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Analytics', description: 'Manage tracking and reporting' },
    ],
  },
  {
    name: MODULES.CART,
    description: 'Customer shopping cart',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Cart', description: 'View cart items' },
      { key: PERMISSIONS.CREATE, name: 'Add to Cart', description: 'Add products to cart' },
      { key: PERMISSIONS.UPDATE, name: 'Update Cart', description: 'Update cart quantities' },
      { key: PERMISSIONS.DELETE, name: 'Remove from Cart', description: 'Remove items from cart' },
    ],
  },
  {
    name: MODULES.PROFILE,
    description: 'Customer account profile',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Profile', description: 'View own profile' },
      { key: PERMISSIONS.UPDATE, name: 'Update Profile', description: 'Edit personal profile' },
    ],
  },
  {
    name: MODULES.WISHLIST,
    description: 'Customer saved items and deal alerts',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Wishlist', description: 'View saved items' },
      { key: PERMISSIONS.CREATE, name: 'Add to Wishlist', description: 'Save items' },
      { key: PERMISSIONS.DELETE, name: 'Remove from Wishlist', description: 'Remove saved items' },
    ],
  },
  {
    name: MODULES.SETTINGS,
    description: 'Global system and platform settings',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Settings', description: 'View application settings' },
      { key: PERMISSIONS.UPDATE, name: 'Update Settings', description: 'Update configurations' },
      { key: PERMISSIONS.MANAGE, name: 'Manage Settings', description: 'Full settings administration' },
    ],
  },
  {
    name: MODULES.AUDIT_LOG,
    description: 'System audit logs and compliance history',
    permissions: [
      { key: PERMISSIONS.VIEW, name: 'View Audit Logs', description: 'Inspect audit trail' },
    ],
  },
];

async function seed() {
  console.log('Seeding Asli Cart database...');

  // 1. Seed Roles
  console.log('1. Seeding system roles...');
  const roleDefinitions = [
    { name: ROLES.SUPER_ADMIN, description: 'Full administrative access and platform control', isSystem: true },
    { name: ROLES.PRODUCT_MANAGER, description: 'Product catalog, deal curation, pricing and affiliate links', isSystem: false },
    { name: ROLES.SOCIAL_MEDIA_MANAGER, description: 'Content publishing, channel broadcasts, and social campaigns', isSystem: false },
    { name: ROLES.CUSTOMER, description: 'Discovery, wishlist, cart, and profile access', isSystem: false },
  ];

  const roleMap: Record<string, string> = {};
  for (const roleDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });
    roleMap[role.name] = role.id;
  }

  // 2. Seed Modules & Permissions
  console.log('2. Seeding modules and module permissions...');
  const permissionMap: Record<string, string> = {}; // key: "module.permissionKey" -> permissionId
  const allPermissionIds: string[] = [];

  for (const modDef of MODULE_DEFINITIONS) {
    const mod = await prisma.module.upsert({
      where: { name: modDef.name },
      update: { description: modDef.description, isActive: true },
      create: { name: modDef.name, description: modDef.description, isActive: true },
    });

    for (const permDef of modDef.permissions) {
      const perm = await prisma.modulePermission.upsert({
        where: {
          moduleId_permissionKey: {
            moduleId: mod.id,
            permissionKey: permDef.key,
          },
        },
        update: {
          permissionName: permDef.name,
          description: permDef.description,
        },
        create: {
          moduleId: mod.id,
          permissionKey: permDef.key,
          permissionName: permDef.name,
          description: permDef.description,
        },
      });

      const mapKey = `${modDef.name}.${permDef.key}`;
      permissionMap[mapKey] = perm.id;
      allPermissionIds.push(perm.id);
    }
  }

  // 3. Seed Role-Permission Assignments
  console.log('3. Assigning role permissions...');

  // Helper to assign permissions idempotently
  const assignPermissionsToRole = async (roleName: string, keys: string[]) => {
    const roleId = roleMap[roleName];
    if (!roleId) return;

    for (const key of keys) {
      const permId = permissionMap[key];
      if (permId) {
        await prisma.roleModulePermission.upsert({
          where: {
            roleId_modulePermissionId: {
              roleId,
              modulePermissionId: permId,
            },
          },
          update: {},
          create: {
            roleId,
            modulePermissionId: permId,
          },
        });
      }
    }
  };

  // SUPER_ADMIN: Gets ALL permissions
  console.log('   -> Granting full permissions to SUPER_ADMIN...');
  const superAdminRoleId = roleMap[ROLES.SUPER_ADMIN];
  for (const permId of allPermissionIds) {
    await prisma.roleModulePermission.upsert({
      where: {
        roleId_modulePermissionId: {
          roleId: superAdminRoleId,
          modulePermissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: superAdminRoleId,
        modulePermissionId: permId,
      },
    });
  }

  // PRODUCT_MANAGER permissions
  console.log('   -> Assigning PRODUCT_MANAGER permissions...');
  await assignPermissionsToRole(ROLES.PRODUCT_MANAGER, [
    'dashboard.view',
    'product.view', 'product.create', 'product.update', 'product.delete', 'product.approve', 'product.reject', 'product.manage',
    'productDiscovery.view', 'productDiscovery.create', 'productDiscovery.update', 'productDiscovery.delete', 'productDiscovery.manage',
    'pricing.view', 'pricing.create', 'pricing.update', 'pricing.manage',
    'offer.view', 'offer.create', 'offer.update', 'offer.delete', 'offer.approve', 'offer.reject', 'offer.publish', 'offer.manage',
    'affiliate.view', 'affiliate.create', 'affiliate.update', 'affiliate.delete', 'affiliate.manage',
    'analytics.view',
  ]);

  // SOCIAL_MEDIA_MANAGER permissions
  console.log('   -> Assigning SOCIAL_MEDIA_MANAGER permissions...');
  await assignPermissionsToRole(ROLES.SOCIAL_MEDIA_MANAGER, [
    'dashboard.view',
    'product.view',
    'offer.view',
    'content.view', 'content.create', 'content.update', 'content.delete', 'content.publish', 'content.manage',
    'socialAccount.view', 'socialAccount.create', 'socialAccount.update', 'socialAccount.delete', 'socialAccount.manage',
    'publishing.view', 'publishing.create', 'publishing.update', 'publishing.publish', 'publishing.manage',
    'analytics.view',
  ]);

  // CUSTOMER permissions
  console.log('   -> Assigning CUSTOMER permissions...');
  await assignPermissionsToRole(ROLES.CUSTOMER, [
    'dashboard.view',
    'profile.view', 'profile.update',
    'cart.view', 'cart.create', 'cart.update', 'cart.delete',
    'wishlist.view', 'wishlist.create', 'wishlist.delete',
    'product.view',
    'offer.view',
  ]);

  // 4. Seed Standard Categories
  console.log('4. Seeding standard product categories...');
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets, computers, audio, and consumer tech' },
    { name: 'Mobile Phones', slug: 'mobiles', description: 'Smartphones, feature phones, and mobile accessories' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, footwear, watches, and accessories' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Furniture, cookware, decor, and home essentials' },
    { name: 'Beauty & Personal Care', slug: 'beauty', description: 'Skincare, haircare, grooming, and cosmetics' },
    { name: 'Appliances', slug: 'appliances', description: 'Large and small home appliances, TVs, and air conditioners' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, isActive: true },
      create: { name: cat.name, slug: cat.slug, description: cat.description, isActive: true },
    });
  }

  // 5. Seed Major E-Commerce Merchants
  console.log('5. Seeding major e-commerce merchants...');
  const merchants = [
    { name: 'Amazon India', slug: 'amazon', websiteUrl: 'https://www.amazon.in', affiliateNetwork: 'CUELINKS' },
    { name: 'Flipkart', slug: 'flipkart', websiteUrl: 'https://www.flipkart.com', affiliateNetwork: 'CUELINKS' },
    { name: 'Myntra', slug: 'myntra', websiteUrl: 'https://www.myntra.com', affiliateNetwork: 'CUELINKS' },
    { name: 'Ajio', slug: 'ajio', websiteUrl: 'https://www.ajio.com', affiliateNetwork: 'CUELINKS' },
    { name: 'TataCliq', slug: 'tatacliq', websiteUrl: 'https://www.tatacliq.com', affiliateNetwork: 'CUELINKS' },
    { name: 'Croma', slug: 'croma', websiteUrl: 'https://www.croma.com', affiliateNetwork: 'CUELINKS' },
  ];

  for (const merch of merchants) {
    await prisma.merchant.upsert({
      where: { slug: merch.slug },
      update: { name: merch.name, websiteUrl: merch.websiteUrl, affiliateNetwork: merch.affiliateNetwork, isActive: true },
      create: { name: merch.name, slug: merch.slug, websiteUrl: merch.websiteUrl, affiliateNetwork: merch.affiliateNetwork, isActive: true },
    });
  }

  console.log('Database seeding completed successfully.');
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

