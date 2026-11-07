import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { categoryRepository, CategoryRepository } from '../repositories/category.repository.js';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { AppError } from '../utils/appError.js';
import { MODULES } from '../constants/modules.js';

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  brand?: string;
  categoryId: string;
  mainImage: string;
  additionalImages?: string[];
  specifications?: any;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  mainImage?: string;
  additionalImages?: string[];
  specifications?: any;
  isAssignedToSmm?: boolean;
}

export class ProductService {
  constructor(
    private productRepo: ProductRepository = productRepository,
    private categoryRepo: CategoryRepository = categoryRepository,
    private auditRepo: AuditLogRepository = auditLogRepository
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async listProducts(params: {
    page: number;
    limit: number;
    categoryId?: string;
    status?: string;
    brand?: string;
    search?: string;
    isAssignedToSmm?: boolean;
  }) {
    return this.productRepo.findMany(params);
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    return product;
  }

  async createProduct(input: CreateProductInput, actorId: string) {
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw AppError.badRequest('Specified category does not exist');
    }

    let baseSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
    let finalSlug = baseSlug;

    // Check slug collision
    const existing = await this.productRepo.findBySlug(finalSlug);
    if (existing) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const product = await this.productRepo.create({
      name: input.name,
      slug: finalSlug,
      description: input.description,
      brand: input.brand,
      categoryId: input.categoryId,
      mainImage: input.mainImage,
      additionalImages: input.additionalImages || [],
      specifications: input.specifications,
      status: 'DRAFT',
      createdById: actorId,
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'product.create',
      moduleName: MODULES.PRODUCT,
      entityId: product.id,
      metadata: { name: product.name, slug: product.slug },
    });

    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput, actorId: string) {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw AppError.notFound('Product not found');
    }

    if (input.categoryId) {
      const category = await this.categoryRepo.findById(input.categoryId);
      if (!category) {
        throw AppError.badRequest('Specified category does not exist');
      }
    }

    const updated = await this.productRepo.update(id, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.brand !== undefined ? { brand: input.brand } : {}),
      ...(input.categoryId ? { category: { connect: { id: input.categoryId } } } : {}),
      ...(input.mainImage ? { mainImage: input.mainImage } : {}),
      ...(input.additionalImages ? { additionalImages: input.additionalImages } : {}),
      ...(input.specifications !== undefined ? { specifications: input.specifications } : {}),
      ...(input.isAssignedToSmm !== undefined ? { isAssignedToSmm: input.isAssignedToSmm } : {}),
      updatedBy: { connect: { id: actorId } },
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'product.update',
      moduleName: MODULES.PRODUCT,
      entityId: id,
      metadata: { changes: Object.keys(input) },
    });

    return updated;
  }

  async submitForApproval(id: string, actorId: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (product.status === 'PENDING_APPROVAL') {
      throw AppError.badRequest('Product is already pending review');
    }

    if (product.status === 'ARCHIVED') {
      throw AppError.badRequest('Archived products cannot be submitted for review');
    }

    const updated = await this.productRepo.update(id, {
      status: 'PENDING_APPROVAL',
      updatedBy: { connect: { id: actorId } },
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'product.submit_approval',
      moduleName: MODULES.PRODUCT,
      entityId: id,
      metadata: { previousStatus: product.status, newStatus: 'PENDING_APPROVAL' },
    });

    return updated;
  }

  async archiveProduct(id: string, actorId: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const updated = await this.productRepo.update(id, {
      status: 'ARCHIVED',
      updatedBy: { connect: { id: actorId } },
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'product.archive',
      moduleName: MODULES.PRODUCT,
      entityId: id,
    });

    return updated;
  }

  async assignToSmm(id: string, isAssigned: boolean, actorId: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const updated = await this.productRepo.update(id, {
      isAssignedToSmm: isAssigned,
      updatedBy: { connect: { id: actorId } },
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: isAssigned ? 'product.assign_smm' : 'product.unassign_smm',
      moduleName: MODULES.PRODUCT,
      entityId: id,
    });

    return updated;
  }
}

export const productService = new ProductService();

