import { userRepository, UserRepository } from '../repositories/user.repository.js';

export interface AdminDashboardSummary {
  users: {
    total: number;
    active: number;
  };
  products: {
    total: number;
    _note: string;
  };
  offers: {
    total: number;
    published: number;
    pendingApprovals: number;
    _note: string;
  };
}

export class DashboardService {
  constructor(private userRepo: UserRepository = userRepository) {}

  async getSummary(): Promise<AdminDashboardSummary> {
    const [totalUsers, activeUsers] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ isActive: true }),
    ]);

    // Product and Offer discovery modules are planned for subsequent phases.
    // Explicitly reporting 0 with documentation note as per specification.
    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      products: {
        total: 0,
        _note: 'Product catalog module pending implementation in Phase 2',
      },
      offers: {
        total: 0,
        published: 0,
        pendingApprovals: 0,
        _note: 'Offer discovery and publishing module pending implementation in Phase 2',
      },
    };
  }
}

export const dashboardService = new DashboardService();

