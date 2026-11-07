import prisma from '../infra/database/prisma.js';

export class WishlistRepository {
  async findByCustomerId(customerId: string) {
    return prisma.wishlist.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true },
                },
                offers: {
                  where: { status: 'PUBLISHED' },
                  include: {
                    merchant: {
                      select: { id: true, name: true, slug: true, logoUrl: true },
                    },
                  },
                  orderBy: { sellingPrice: 'asc' },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getOrCreateWishlist(customerId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { customerId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { customerId },
      });
    }

    return wishlist;
  }

  async findItemById(itemId: string) {
    return prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: {
        wishlist: true,
        product: true,
      },
    });
  }

  async findItemByWishlistAndProduct(wishlistId: string, productId: string) {
    return prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId,
          productId,
        },
      },
    });
  }

  async addItem(data: { wishlistId: string; productId: string }) {
    return prisma.wishlistItem.create({
      data: {
        wishlistId: data.wishlistId,
        productId: data.productId,
      },
      include: {
        product: {
          include: {
            category: true,
            offers: {
              where: { status: 'PUBLISHED' },
              include: { merchant: true },
            },
          },
        },
      },
    });
  }

  async removeItem(itemId: string) {
    return prisma.wishlistItem.delete({
      where: { id: itemId },
    });
  }

  async countItems(wishlistId: string): Promise<number> {
    return prisma.wishlistItem.count({
      where: { wishlistId },
    });
  }
}

export const wishlistRepository = new WishlistRepository();

