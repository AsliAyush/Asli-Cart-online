import { moduleRepository, ModuleRepository } from '../repositories/module.repository.js';
import { AppError } from '../utils/appError.js';

export class ModuleService {
  constructor(private moduleRepo: ModuleRepository = moduleRepository) {}

  async listModules() {
    return this.moduleRepo.findAll();
  }

  async getModuleById(id: string) {
    const mod = await this.moduleRepo.findById(id);
    if (!mod) {
      throw AppError.notFound('Module not found');
    }
    return mod;
  }

  async getModulePermissions(moduleId: string) {
    const mod = await this.moduleRepo.findById(moduleId);
    if (!mod) {
      throw AppError.notFound('Module not found');
    }

    return this.moduleRepo.findPermissionsByModuleId(moduleId);
  }
}

export const moduleService = new ModuleService();

