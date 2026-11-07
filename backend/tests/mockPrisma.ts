import {
  mockRoles,
  mockModules,
  mockPermissions,
  mockRoleModulePermissions,
  mockCategories,
  mockMerchants,
} from './mockData.js';

export interface MockStore {
  users: any[];
  roles: any[];
  modules: any[];
  modulePermissions: any[];
  roleModulePermissions: any[];
  refreshTokens: any[];
  auditLogs: any[];
  categories: any[];
  merchants: any[];
  products: any[];
  offers: any[];
  priceHistories: any[];
  affiliateLinks: any[];
  discoveredProducts: any[];
  carts: any[];
  cartItems: any[];
  wishlists: any[];
  wishlistItems: any[];
  affiliateClicks: any[];
}

export function createMockStore(): MockStore {
  return {
    roles: JSON.parse(JSON.stringify(mockRoles)),
    modules: JSON.parse(JSON.stringify(mockModules)),
    modulePermissions: JSON.parse(JSON.stringify(mockPermissions)),
    roleModulePermissions: JSON.parse(JSON.stringify(mockRoleModulePermissions)),
    categories: JSON.parse(JSON.stringify(mockCategories)),
    merchants: JSON.parse(JSON.stringify(mockMerchants)),
    users: [],
    refreshTokens: [],
    auditLogs: [],
    products: [],
    offers: [],
    priceHistories: [],
    affiliateLinks: [],
    discoveredProducts: [],
    carts: [],
    cartItems: [],
    wishlists: [],
    wishlistItems: [],
    affiliateClicks: [],
  };
}

export function buildMockPrisma(store: MockStore) {
  const mockPrisma = {
    user: {
      findUnique: async ({ where, include }: any) => {
        let user: any = null;
        if (where.id) {
          user = store.users.find((u) => u.id === where.id);
        } else if (where.email) {
          user = store.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase());
        }
        if (!user) return null;
        const res: any = { ...user };
        if (include?.role) {
          res.role = store.roles.find((r) => r.id === user.roleId);
        }
        return res;
      },
      findFirst: async ({ where }: any) => {
        return (
          store.users.find((u) => {
            if (where.isActive !== undefined && u.isActive !== where.isActive) return false;
            if (where.role?.name) {
              const role = store.roles.find((r) => r.id === u.roleId);
              if (!role || role.name !== where.role.name) return false;
            }
            return true;
          }) || null
        );
      },
      findMany: async ({ where, skip = 0, take = 10 }: any) => {
        let items = store.users.filter((u) => {
          if (where?.roleId && u.roleId !== where.roleId) return false;
          if (where?.isActive !== undefined && u.isActive !== where.isActive) return false;
          if (where?.OR) {
            const matches = where.OR.some((cond: any) => {
              if (cond.fullName?.contains) {
                return u.fullName.toLowerCase().includes(cond.fullName.contains.toLowerCase());
              }
              if (cond.email?.contains) {
                return u.email.toLowerCase().includes(cond.email.contains.toLowerCase());
              }
              return false;
            });
            if (!matches) return false;
          }
          return true;
        });

        const paged = items.slice(skip, skip + take).map((u) => {
          const role = store.roles.find((r) => r.id === u.roleId);
          return {
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            roleId: u.roleId,
            isActive: u.isActive,
            emailVerified: u.emailVerified,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            role: role ? { id: role.id, name: role.name, description: role.description, isSystem: role.isSystem } : null,
          };
        });
        return paged;
      },
      count: async ({ where }: any = {}) => {
        return store.users.filter((u) => {
          if (where?.roleId && u.roleId !== where.roleId) return false;
          if (where?.isActive !== undefined && u.isActive !== where.isActive) return false;
          if (where?.role?.name) {
            const role = store.roles.find((r) => r.id === u.roleId);
            if (!role || role.name !== where.role.name) return false;
          }
          return true;
        }).length;
      },
      create: async ({ data, include }: any) => {
        const newUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          roleId: data.roleId,
          isActive: data.isActive ?? true,
          emailVerified: data.emailVerified ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.users.push(newUser);
        const res: any = { ...newUser };
        if (include?.role) {
          res.role = store.roles.find((r) => r.id === newUser.roleId);
        }
        return res;
      },
      update: async ({ where, data, include }: any) => {
        const user = store.users.find((u) => u.id === where.id);
        if (!user) throw new Error('User not found');
        if (data.fullName !== undefined) user.fullName = data.fullName;
        if (data.phone !== undefined) user.phone = data.phone;
        if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
        if (data.passwordHash !== undefined) user.passwordHash = data.passwordHash;
        if (data.isActive !== undefined) user.isActive = data.isActive;
        if (data.role?.connect?.id) user.roleId = data.role.connect.id;
        user.updatedAt = new Date();

        const res: any = { ...user };
        if (include?.role) {
          res.role = store.roles.find((r) => r.id === user.roleId);
        }
        return res;
      },
    },
    role: {
      findMany: async () => {
        return store.roles.map((r) => ({
          ...r,
          _count: {
            users: store.users.filter((u) => u.roleId === r.id).length,
            roleModulePermissions: store.roleModulePermissions.filter((rmp) => rmp.roleId === r.id).length,
          },
        }));
      },
      findUnique: async ({ where }: any) => {
        if (where.id) return store.roles.find((r) => r.id === where.id) || null;
        if (where.name) return store.roles.find((r) => r.name === where.name) || null;
        return null;
      },
    },
    module: {
      findMany: async () => {
        return store.modules.map((m) => ({
          ...m,
          _count: {
            modulePermissions: store.modulePermissions.filter((mp) => mp.moduleId === m.id).length,
          },
        }));
      },
      findUnique: async ({ where }: any) => {
        if (where.id) return store.modules.find((m) => m.id === where.id) || null;
        if (where.name) return store.modules.find((m) => m.name === where.name) || null;
        return null;
      },
    },
    modulePermission: {
      findMany: async ({ where }: any = {}) => {
        return store.modulePermissions
          .filter((mp) => {
            if (where?.moduleId && mp.moduleId !== where.moduleId) return false;
            if (where?.id?.in && !where.id.in.includes(mp.id)) return false;
            return true;
          })
          .map((mp) => ({
            ...mp,
            module: store.modules.find((m) => m.id === mp.moduleId),
          }));
      },
    },
    roleModulePermission: {
      findMany: async ({ where }: any) => {
        return store.roleModulePermissions
          .filter((rmp) => rmp.roleId === where.roleId)
          .map((rmp) => {
            const mp = store.modulePermissions.find((p) => p.id === rmp.modulePermissionId);
            return {
              ...rmp,
              modulePermission: mp
                ? {
                    ...mp,
                    module: store.modules.find((m) => m.id === mp.moduleId),
                  }
                : null,
            };
          });
      },
      findFirst: async ({ where }: any) => {
        return (
          store.roleModulePermissions.find((rmp) => {
            if (rmp.roleId !== where.roleId) return false;
            const mp = store.modulePermissions.find((p) => p.id === rmp.modulePermissionId);
            if (!mp) return false;
            if (where.modulePermission?.permissionKey && mp.permissionKey !== where.modulePermission.permissionKey) {
              return false;
            }
            if (where.modulePermission?.module?.name) {
              const mod = store.modules.find((m) => m.id === mp.moduleId);
              if (!mod || mod.name !== where.modulePermission.module.name) return false;
            }
            return true;
          }) || null
        );
      },
      deleteMany: async ({ where }: any) => {
        store.roleModulePermissions = store.roleModulePermissions.filter((rmp) => rmp.roleId !== where.roleId);
        return { count: 0 };
      },
      createMany: async ({ data }: any) => {
        for (const item of data) {
          store.roleModulePermissions.push({
            id: `rmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            roleId: item.roleId,
            modulePermissionId: item.modulePermissionId,
            createdAt: new Date(),
          });
        }
        return { count: data.length };
      },
    },
    category: {
      findMany: async () =>
        store.categories.map((c) => ({
          ...c,
          _count: {
            products: store.products.filter((p) => p.categoryId === c.id && p.status === 'PUBLISHED').length,
          },
        })),
      findUnique: async ({ where }: any) => {
        if (where.id) return store.categories.find((c) => c.id === where.id) || null;
        if (where.slug) return store.categories.find((c) => c.slug === where.slug) || null;
        return null;
      },
    },
    merchant: {
      findMany: async () => store.merchants,
      findUnique: async ({ where }: any) => {
        if (where.id) return store.merchants.find((m) => m.id === where.id) || null;
        if (where.slug) return store.merchants.find((m) => m.slug === where.slug) || null;
        return null;
      },
    },
    product: {
      findMany: async ({ where, skip = 0, take = 10 }: any) => {
        let items = store.products.filter((p) => {
          if (where?.categoryId && p.categoryId !== where.categoryId) return false;
          if (where?.status && p.status !== where.status) return false;
          if (where?.isAssignedToSmm !== undefined && p.isAssignedToSmm !== where.isAssignedToSmm) return false;
          if (where?.brand && !p.brand?.toLowerCase().includes(where.brand.contains?.toLowerCase() || '')) return false;
          if (where?.OR) {
            const matches = where.OR.some((cond: any) => {
              if (cond.name?.contains) return p.name.toLowerCase().includes(cond.name.contains.toLowerCase());
              if (cond.description?.contains) return p.description?.toLowerCase().includes(cond.description.contains.toLowerCase());
              if (cond.brand?.contains) return p.brand?.toLowerCase().includes(cond.brand.contains.toLowerCase());
              return false;
            });
            if (!matches) return false;
          }
          return true;
        });

        return items.slice(skip, skip + take).map((p) => {
          const category = store.categories.find((c) => c.id === p.categoryId);
          const createdBy = store.users.find((u) => u.id === p.createdById);
          const offers = store.offers
            .filter((o) => o.productId === p.id)
            .map((o) => ({
              ...o,
              merchant: store.merchants.find((m) => m.id === o.merchantId),
            }));
          return {
            ...p,
            category,
            createdBy,
            offers,
            _count: { offers: offers.length },
          };
        });
      },
      findFirst: async ({ where }: any) => {
        const p = store.products.find((prod) => {
          if (where.status && prod.status !== where.status) return false;
          if (where.OR) {
            return where.OR.some((cond: any) => (cond.id && prod.id === cond.id) || (cond.slug && prod.slug === cond.slug));
          }
          if (where.id && prod.id !== where.id) return false;
          if (where.slug && prod.slug !== where.slug) return false;
          return true;
        });
        if (!p) return null;
        return {
          ...p,
          category: store.categories.find((c) => c.id === p.categoryId),
          offers: store.offers
            .filter((o) => o.productId === p.id)
            .map((o) => ({
              ...o,
              merchant: store.merchants.find((m) => m.id === o.merchantId),
            })),
        };
      },
      findUnique: async ({ where }: any) => {
        const p = store.products.find((prod) => (where.id ? prod.id === where.id : prod.slug === where.slug));
        if (!p) return null;
        return {
          ...p,
          category: store.categories.find((c) => c.id === p.categoryId),
          createdBy: store.users.find((u) => u.id === p.createdById),
          offers: store.offers
            .filter((o) => o.productId === p.id)
            .map((o) => ({ ...o, merchant: store.merchants.find((m) => m.id === o.merchantId) })),
          priceHistories: store.priceHistories.filter((ph) => ph.productId === p.id),
        };
      },
      create: async ({ data }: any) => {
        const newProduct = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          brand: data.brand || null,
          categoryId: data.categoryId,
          mainImage: data.mainImage,
          additionalImages: data.additionalImages || [],
          specifications: data.specifications || null,
          status: data.status || 'DRAFT',
          isAssignedToSmm: data.isAssignedToSmm ?? false,
          createdById: data.createdById,
          updatedById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.products.push(newProduct);
        return {
          ...newProduct,
          category: store.categories.find((c) => c.id === newProduct.categoryId),
        };
      },
      update: async ({ where, data }: any) => {
        const product = store.products.find((p) => p.id === where.id);
        if (!product) throw new Error('Product not found');
        if (data.name !== undefined) product.name = data.name;
        if (data.description !== undefined) product.description = data.description;
        if (data.brand !== undefined) product.brand = data.brand;
        if (data.category?.connect?.id) product.categoryId = data.category.connect.id;
        if (data.mainImage !== undefined) product.mainImage = data.mainImage;
        if (data.status !== undefined) product.status = data.status;
        if (data.isAssignedToSmm !== undefined) product.isAssignedToSmm = data.isAssignedToSmm;
        if (data.updatedBy?.connect?.id) product.updatedById = data.updatedBy.connect.id;
        product.updatedAt = new Date();
        return {
          ...product,
          category: store.categories.find((c) => c.id === product.categoryId),
        };
      },
      count: async ({ where }: any = {}) => {
        return store.products.filter((p) => {
          if (where?.status && p.status !== where.status) return false;
          if (where?.isAssignedToSmm !== undefined && p.isAssignedToSmm !== where.isAssignedToSmm) return false;
          return true;
        }).length;
      },
    },
    offer: {
      findMany: async ({ where, orderBy, skip = 0, take = 10 }: any) => {
        let items = store.offers.filter((o) => {
          if (where?.productId && o.productId !== where.productId) return false;
          if (where?.merchantId && o.merchantId !== where.merchantId) return false;
          if (where?.status && o.status !== where.status) return false;
          return true;
        });
        if (orderBy?.sellingPrice === 'asc') {
          items.sort((a, b) => Number(a.sellingPrice) - Number(b.sellingPrice));
        } else if (orderBy?.discountPercentage === 'desc') {
          items.sort((a, b) => Number(b.discountPercentage) - Number(a.discountPercentage));
        }
        return items.slice(skip, skip + take).map((o) => ({
          ...o,
          product: store.products.find((p) => p.id === o.productId),
          merchant: store.merchants.find((m) => m.id === o.merchantId),
          createdBy: store.users.find((u) => u.id === o.createdById),
        }));
      },
      findUnique: async ({ where }: any) => {
        const o = store.offers.find((off) => off.id === where.id);
        if (!o) return null;
        return {
          ...o,
          product: store.products.find((p) => p.id === o.productId),
          merchant: store.merchants.find((m) => m.id === o.merchantId),
          createdBy: store.users.find((u) => u.id === o.createdById),
          priceHistories: store.priceHistories.filter((ph) => ph.offerId === o.id),
          affiliateLinks: store.affiliateLinks.filter((al) => al.offerId === o.id),
        };
      },
      create: async ({ data }: any) => {
        const newOffer = {
          id: `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: data.productId,
          merchantId: data.merchantId,
          title: data.title,
          originalPrice: data.originalPrice,
          sellingPrice: data.sellingPrice,
          discountPercentage: data.discountPercentage,
          currency: data.currency || 'INR',
          couponCode: data.couponCode || null,
          originalUrl: data.originalUrl,
          affiliateUrl: data.affiliateUrl || null,
          availability: data.availability || 'IN_STOCK',
          status: data.status || 'DRAFT',
          priceVerifiedAt: data.priceVerifiedAt || new Date(),
          priceSource: data.priceSource || 'manual',
          rejectionReason: null,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          createdById: data.createdById,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.offers.push(newOffer);
        return {
          ...newOffer,
          product: store.products.find((p) => p.id === newOffer.productId),
          merchant: store.merchants.find((m) => m.id === newOffer.merchantId),
        };
      },
      update: async ({ where, data }: any) => {
        const offer = store.offers.find((o) => o.id === where.id);
        if (!offer) throw new Error('Offer not found');
        if (data.title !== undefined) offer.title = data.title;
        if (data.originalPrice !== undefined) offer.originalPrice = data.originalPrice;
        if (data.sellingPrice !== undefined) offer.sellingPrice = data.sellingPrice;
        if (data.discountPercentage !== undefined) offer.discountPercentage = data.discountPercentage;
        if (data.status !== undefined) offer.status = data.status;
        if (data.availability !== undefined) offer.availability = data.availability;
        offer.updatedAt = new Date();
        return {
          ...offer,
          product: store.products.find((p) => p.id === offer.productId),
          merchant: store.merchants.find((m) => m.id === offer.merchantId),
        };
      },
      count: async ({ where }: any = {}) => {
        return store.offers.filter((o) => {
          if (where?.status && o.status !== where.status) return false;
          return true;
        }).length;
      },
    },
    priceHistory: {
      create: async ({ data }: any) => {
        const ph = {
          id: `ph-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: data.productId,
          offerId: data.offerId || null,
          price: data.price,
          originalPrice: data.originalPrice || null,
          discountPercentage: data.discountPercentage || null,
          currency: data.currency || 'INR',
          source: data.source || 'manual',
          recordedAt: new Date(),
        };
        store.priceHistories.push(ph);
        return ph;
      },
      findMany: async ({ where, take = 20 }: any) => {
        return store.priceHistories
          .filter((ph) => ph.productId === where.productId)
          .slice(0, take)
          .map((ph) => ({
            ...ph,
            offer: store.offers.find((o) => o.id === ph.offerId),
          }));
      },
    },
    affiliateLink: {
      create: async ({ data }: any) => {
        const link = {
          id: `aff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          offerId: data.offerId || null,
          originalUrl: data.originalUrl,
          affiliateUrl: data.affiliateUrl,
          provider: data.provider || 'CUELINKS',
          subId1: data.subId1 || null,
          subId2: data.subId2 || null,
          status: data.status || 'ACTIVE',
          createdById: data.createdById,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.affiliateLinks.push(link);
        return link;
      },
      findMany: async ({ where, skip = 0, take = 20 }: any) => {
        let items = store.affiliateLinks.filter((al) => {
          if (where?.offerId && al.offerId !== where.offerId) return false;
          if (where?.status && al.status !== where.status) return false;
          return true;
        });
        return items.slice(skip, skip + take);
      },
      findUnique: async ({ where }: any) => {
        return store.affiliateLinks.find((al) => al.id === where.id) || null;
      },
      count: async () => store.affiliateLinks.length,
    },
    discoveredProduct: {
      findMany: async () => store.discoveredProducts,
      findByExternalId: async (merchantId: string, externalId: string) => {
        return (
          store.discoveredProducts.find(
            (dp) => dp.merchantId === merchantId && dp.externalId === externalId
          ) || null
        );
      },
      findUnique: async ({ where }: any) => {
        if (where.id) return store.discoveredProducts.find((dp) => dp.id === where.id) || null;
        if (where.merchantId_externalId) {
          return (
            store.discoveredProducts.find(
              (dp) =>
                dp.merchantId === where.merchantId_externalId.merchantId &&
                dp.externalId === where.merchantId_externalId.externalId
            ) || null
          );
        }
        return null;
      },
      create: async ({ data }: any) => {
        const dp = {
          id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...data,
          discoveredAt: new Date(),
        };
        store.discoveredProducts.push(dp);
        return dp;
      },
      update: async ({ where, data }: any) => {
        const dp = store.discoveredProducts.find((d) => d.id === where.id);
        if (!dp) throw new Error('Discovered product not found');
        if (data.imported !== undefined) dp.imported = data.imported;
        if (data.importedProductId !== undefined) dp.importedProductId = data.importedProductId;
        return dp;
      },
      count: async () => store.discoveredProducts.length,
    },
    refreshToken: {
      create: async ({ data }: any) => {
        const token = {
          id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          revokedAt: null,
          createdAt: new Date(),
        };
        store.refreshTokens.push(token);
        return token;
      },
      findUnique: async ({ where }: any) => {
        const token = store.refreshTokens.find((t) => t.tokenHash === where.tokenHash);
        if (!token) return null;
        const user = store.users.find((u) => u.id === token.userId);
        return {
          ...token,
          user: user
            ? {
                ...user,
                role: store.roles.find((r) => r.id === user.roleId),
              }
            : null,
        };
      },
      update: async ({ where, data }: any) => {
        const token = store.refreshTokens.find((t) => t.id === where.id);
        if (!token) throw new Error('Token not found');
        if (data.revokedAt) token.revokedAt = data.revokedAt;
        return token;
      },
      updateMany: async ({ where, data }: any) => {
        let count = 0;
        for (const token of store.refreshTokens) {
          if (token.userId === where.userId && (where.revokedAt === null ? token.revokedAt === null : true)) {
            token.revokedAt = data.revokedAt;
            count++;
          }
        }
        return { count };
      },
      deleteMany: async () => ({ count: 0 }),
    },
    auditLog: {
      create: async ({ data }: any) => {
        const log = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          actorUserId: data.actorUserId,
          action: data.action,
          moduleName: data.moduleName,
          entityId: data.entityId,
          metadata: data.metadata,
          createdAt: new Date(),
        };
        store.auditLogs.push(log);
        return log;
      },
      findMany: async () => store.auditLogs,
      count: async () => store.auditLogs.length,
    },
    cart: {
      findUnique: async ({ where }: any) => {
        let cart: any = null;
        if (where.customerId) cart = store.carts.find((c) => c.customerId === where.customerId);
        if (where.id) cart = store.carts.find((c) => c.id === where.id);
        if (!cart) return null;

        const items = store.cartItems
          .filter((ci) => ci.cartId === cart.id)
          .map((ci) => {
            const offer = store.offers.find((o) => o.id === ci.offerId);
            const product = offer ? store.products.find((p) => p.id === offer.productId) : null;
            const merchant = offer ? store.merchants.find((m) => m.id === offer.merchantId) : null;
            const affLinks = offer ? store.affiliateLinks.filter((al) => al.offerId === offer.id) : [];

            return {
              ...ci,
              offer: offer
                ? {
                    ...offer,
                    product,
                    merchant,
                    affiliateLinks: affLinks,
                  }
                : null,
            };
          });

        return { ...cart, items };
      },
      create: async ({ data }: any) => {
        const cart = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          customerId: data.customerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.carts.push(cart);
        return cart;
      },
    },
    cartItem: {
      findUnique: async ({ where }: any) => {
        if (where.id) {
          const item = store.cartItems.find((ci) => ci.id === where.id);
          if (!item) return null;
          const cart = store.carts.find((c) => c.id === item.cartId);
          const offer = store.offers.find((o) => o.id === item.offerId);
          return { ...item, cart, offer };
        }
        if (where.cartId_offerId) {
          return (
            store.cartItems.find(
              (ci) =>
                ci.cartId === where.cartId_offerId.cartId &&
                ci.offerId === where.cartId_offerId.offerId
            ) || null
          );
        }
        return null;
      },
      findMany: async ({ where }: any) => {
        let items = store.cartItems;
        if (where?.cartId) items = items.filter((ci) => ci.cartId === where.cartId);
        return items.map((ci) => {
          const offer = store.offers.find((o) => o.id === ci.offerId);
          const product = offer ? store.products.find((p) => p.id === offer.productId) : null;
          const merchant = offer ? store.merchants.find((m) => m.id === offer.merchantId) : null;
          return {
            ...ci,
            offer: offer ? { ...offer, product, merchant } : null,
          };
        });
      },
      create: async ({ data }: any) => {
        const item = {
          id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          cartId: data.cartId,
          offerId: data.offerId,
          quantity: data.quantity || 1,
          priceSnapshot: data.priceSnapshot,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.cartItems.push(item);
        const offer = store.offers.find((o) => o.id === item.offerId);
        const product = offer ? store.products.find((p) => p.id === offer.productId) : null;
        const merchant = offer ? store.merchants.find((m) => m.id === offer.merchantId) : null;
        return { ...item, offer: offer ? { ...offer, product, merchant } : null };
      },
      update: async ({ where, data }: any) => {
        const item = store.cartItems.find((ci) => ci.id === where.id);
        if (!item) throw new Error('Cart item not found');
        if (data.quantity !== undefined) item.quantity = data.quantity;
        item.updatedAt = new Date();
        const offer = store.offers.find((o) => o.id === item.offerId);
        const product = offer ? store.products.find((p) => p.id === offer.productId) : null;
        const merchant = offer ? store.merchants.find((m) => m.id === offer.merchantId) : null;
        return { ...item, offer: offer ? { ...offer, product, merchant } : null };
      },
      delete: async ({ where }: any) => {
        const idx = store.cartItems.findIndex((ci) => ci.id === where.id);
        if (idx !== -1) {
          const deleted = store.cartItems.splice(idx, 1)[0];
          return deleted;
        }
        return null;
      },
      deleteMany: async ({ where }: any) => {
        const initial = store.cartItems.length;
        if (where?.cartId) {
          store.cartItems = store.cartItems.filter((ci) => ci.cartId !== where.cartId);
        }
        return { count: initial - store.cartItems.length };
      },
      count: async ({ where }: any) => {
        let items = store.cartItems;
        if (where?.cartId) items = items.filter((ci) => ci.cartId === where.cartId);
        return items.length;
      },
    },
    wishlist: {
      findUnique: async ({ where }: any) => {
        let wishlist: any = null;
        if (where.customerId) wishlist = store.wishlists.find((w) => w.customerId === where.customerId);
        if (where.id) wishlist = store.wishlists.find((w) => w.id === where.id);
        if (!wishlist) return null;

        const items = store.wishlistItems
          .filter((wi) => wi.wishlistId === wishlist.id)
          .map((wi) => {
            const product = store.products.find((p) => p.id === wi.productId);
            const category = product ? store.categories.find((c) => c.id === product.categoryId) : null;
            const offers = product
              ? store.offers
                  .filter((o) => o.productId === product.id && o.status === 'PUBLISHED')
                  .map((o) => {
                    const merchant = store.merchants.find((m) => m.id === o.merchantId);
                    return { ...o, merchant };
                  })
              : [];

            return {
              ...wi,
              product: product
                ? {
                    ...product,
                    category,
                    offers,
                  }
                : null,
            };
          });

        return { ...wishlist, items };
      },
      create: async ({ data }: any) => {
        const wishlist = {
          id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          customerId: data.customerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.wishlists.push(wishlist);
        return wishlist;
      },
    },
    wishlistItem: {
      findUnique: async ({ where }: any) => {
        if (where.id) {
          const item = store.wishlistItems.find((wi) => wi.id === where.id);
          if (!item) return null;
          const wishlist = store.wishlists.find((w) => w.id === item.wishlistId);
          const product = store.products.find((p) => p.id === item.productId);
          return { ...item, wishlist, product };
        }
        if (where.wishlistId_productId) {
          return (
            store.wishlistItems.find(
              (wi) =>
                wi.wishlistId === where.wishlistId_productId.wishlistId &&
                wi.productId === where.wishlistId_productId.productId
            ) || null
          );
        }
        return null;
      },
      findMany: async ({ where }: any) => {
        let items = store.wishlistItems;
        if (where?.wishlistId) items = items.filter((wi) => wi.wishlistId === where.wishlistId);
        return items;
      },
      create: async ({ data }: any) => {
        const item = {
          id: `wi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          wishlistId: data.wishlistId,
          productId: data.productId,
          createdAt: new Date(),
        };
        store.wishlistItems.push(item);
        const product = store.products.find((p) => p.id === item.productId);
        const category = product ? store.categories.find((c) => c.id === product.categoryId) : null;
        const offers = product ? store.offers.filter((o) => o.productId === product.id) : [];
        return {
          ...item,
          product: product ? { ...product, category, offers } : null,
        };
      },
      delete: async ({ where }: any) => {
        const idx = store.wishlistItems.findIndex((wi) => wi.id === where.id);
        if (idx !== -1) {
          const deleted = store.wishlistItems.splice(idx, 1)[0];
          return deleted;
        }
        return null;
      },
      count: async ({ where }: any) => {
        let items = store.wishlistItems;
        if (where?.wishlistId) items = items.filter((wi) => wi.wishlistId === where.wishlistId);
        return items.length;
      },
    },
    affiliateClick: {
      create: async ({ data }: any) => {
        const click = {
          id: `clk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...data,
          clickedAt: new Date(),
        };
        store.affiliateClicks.push(click);
        const offer = store.offers.find((o) => o.id === data.offerId);
        const product = store.products.find((p) => p.id === data.productId);
        const merchant = store.merchants.find((m) => m.id === data.merchantId);
        return {
          ...click,
          offer: offer ? { ...offer, merchant } : null,
          product,
        };
      },
      findUnique: async ({ where }: any) => {
        const click = store.affiliateClicks.find((c) => c.clickReference === where.clickReference);
        if (!click) return null;
        const offer = store.offers.find((o) => o.id === click.offerId);
        const product = store.products.find((p) => p.id === click.productId);
        const merchant = store.merchants.find((m) => m.id === click.merchantId);
        const affLinks = offer ? store.affiliateLinks.filter((al) => al.offerId === offer.id) : [];
        return {
          ...click,
          offer: offer ? { ...offer, merchant, affiliateLinks: affLinks } : null,
          product,
          merchant,
        };
      },
      count: async () => store.affiliateClicks.length,
    },
    $queryRaw: async () => [{ '1': 1 }],
    $transaction: async (cb: any) => cb(mockPrisma),
    $disconnect: async () => {},
  };

  return mockPrisma;
}
