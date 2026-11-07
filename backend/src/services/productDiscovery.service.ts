import { discoveredProductRepository, DiscoveredProductRepository } from '../repositories/discoveredProduct.repository.js';
import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { merchantRepository, MerchantRepository } from '../repositories/merchant.repository.js';
import { categoryRepository, CategoryRepository } from '../repositories/category.repository.js';
import { offerService, OfferService } from './offer.service.js';
import { defaultDiscoveryProvider, IProductDiscoveryProvider } from '../infra/integrations/discovery/index.js';
import { AppError } from '../utils/appError.js';

export class ProductDiscoveryService {
  constructor(
    private discoveredRepo: DiscoveredProductRepository = discoveredProductRepository,
    private productRepo: ProductRepository = productRepository,
    private merchantRepo: MerchantRepository = merchantRepository,
    private categoryRepo: CategoryRepository = categoryRepository,
    private offerSvc: OfferService = offerService,
    private discoveryProvider: IProductDiscoveryProvider = defaultDiscoveryProvider
  ) {}

  async searchDiscovered(params: {
    keyword?: string;
    category?: string;
    merchant?: string;
    limit?: number;
  }) {
    return this.discoveryProvider.searchDiscovered(params);
  }

  async getDiscoveredItem(externalId: string) {
    const item = await this.discoveryProvider.getDiscoveredById(externalId);
    if (!item) {
      throw AppError.notFound('Discovered product not found');
    }
    return item;
  }

  async importProduct(externalId: string, actorId: string) {
    const item = await this.discoveryProvider.getDiscoveredById(externalId);
    if (!item) {
      throw AppError.notFound('Discovered product could not be found for import');
    }

    // Resolve merchant
    let merchant = await this.merchantRepo.findBySlug(item.merchantSlug);
    if (!merchant) {
      const allMerchants = await this.merchantRepo.findAll();
      merchant = allMerchants[0];
      if (!merchant) {
        throw AppError.badRequest('No active merchant found for product import');
      }
    }

    // Check if this externalId was already imported for this merchant
    const existingDiscovered = await this.discoveredRepo.findByExternalId(
      merchant.id,
      item.externalId
    );

    if (existingDiscovered && existingDiscovered.imported) {
      throw AppError.conflict('This product has already been imported into the catalog');
    }

    // Match or fallback category
    const categories = await this.categoryRepo.findAll();
    let category = categories.find(
      (c) => c.name.toLowerCase() === (item.category || '').toLowerCase()
    );
    if (!category) {
      category = categories[0];
      if (!category) {
        throw AppError.badRequest('No active category available to associate with product');
      }
    }

    // Generate unique slug
    const baseSlug = item.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    const existingProductWithSlug = await this.productRepo.findBySlug(slug);
    if (existingProductWithSlug) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // Create AsliCart Product
    const newProduct = await this.productRepo.create({
      name: item.title,
      slug,
      brand: item.brand,
      categoryId: category.id,
      mainImage: item.imageUrl || 'https://via.placeholder.com/600x600',
      specifications: item.specifications || {},
      status: 'DRAFT',
      createdById: actorId,
    });

    // Create corresponding initial Offer
    const newOffer = await this.offerSvc.createOffer(
      {
        productId: newProduct.id,
        merchantId: merchant.id,
        title: item.title,
        originalPrice: item.originalPrice,
        sellingPrice: item.sellingPrice,
        currency: item.currency || 'INR',
        originalUrl: item.productUrl,
        availability: 'IN_STOCK',
        priceSource: 'discovery_provider',
      },
      actorId
    );

    // Record or update DiscoveredProduct record as imported
    if (existingDiscovered) {
      await this.discoveredRepo.markImported(existingDiscovered.id, newProduct.id);
    } else {
      const disc = await this.discoveredRepo.create({
        externalId: item.externalId,
        merchantId: merchant.id,
        title: item.title,
        brand: item.brand,
        category: item.category,
        price: item.sellingPrice,
        originalPrice: item.originalPrice,
        discountPercentage: item.discountPercentage,
        currency: item.currency || 'INR',
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
        imported: true,
      });
      await this.discoveredRepo.markImported(disc.id, newProduct.id);
    }

    return {
      product: newProduct,
      offer: newOffer,
      message: 'Product successfully imported from discovery feed',
    };
  }
}

export const productDiscoveryService = new ProductDiscoveryService();

