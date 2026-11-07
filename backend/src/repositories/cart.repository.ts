import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';

export class CartRepository {
  async findByCustomerId(customerId: string) {
    return prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            offer: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    mainImage: true,
                    brand: true,
                    status: true,
                  },
                },
                merchant: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    logoUrl: true,
                    websiteUrl: true,
                  },
                },
                affiliateLinks: {
                  where: { status: 'ACTIVE' },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getOrCreateCart(customerId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
      });
    }

    return cart;
  }

  async findItemById(itemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        offer: true,
      },
    });
  }

  async findItemByCartAndOffer(cartId: string, offerId: string) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_offerId: {
          cartId,
          offerId,
        },
      },
    });
  }

  async addItem(data: {
    cartId: string;
    offerId: string;
    quantity: number;
    priceSnapshot: number;
  }) {
    return prisma.cartItem.create({
      data: {
        cartId: data.cartId,
        offerId: data.offerId,
        quantity: data.quantity,
        priceSnapshot: data.priceSnapshot,
      },
      include: {
        offer: {
          include: {
            product: true,
            merchant: true,
          },
        },
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        offer: {
          include: {
            product: true,
            merchant: true,
          },
        },
      },
    });
  }

  async removeItem(itemId: string) {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async countItems(cartId: string): Promise<number> {
    return prisma.cartItem.count({
      where: { cartId },
    });
  }
}

export const cartRepository = new CartRepository();

