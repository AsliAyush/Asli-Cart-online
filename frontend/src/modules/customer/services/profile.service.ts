import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { CustomerProfile } from "../types";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export class CustomerProfileService {
  /**
   * Get authenticated customer profile
   * GET /api/v1/customer/profile
   */
  async getProfile(): Promise<CustomerProfile> {
    const res = await apiClient.get<ApiResponse<CustomerProfile>>("/customer/profile");
    if (!res.data.data) {
      throw new Error("Unable to load customer profile");
    }
    return res.data.data;
  }

  /**
   * Update profile fields (full name, phone, avatar)
   * PATCH /api/v1/customer/profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<CustomerProfile> {
    const res = await apiClient.patch<ApiResponse<CustomerProfile>>(
      "/customer/profile",
      payload
    );
    if (!res.data.data) {
      throw new Error("Failed to update profile");
    }
    return res.data.data;
  }

  /**
   * Change customer password
   * PATCH /api/v1/customer/profile/change-password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const res = await apiClient.patch<ApiResponse<{ message: string }>>(
      "/customer/profile/change-password",
      payload
    );
    return res.data.data || { message: "Password updated successfully" };
  }
}

export const customerProfileService = new CustomerProfileService();

