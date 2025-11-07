import api from "./api";

export interface AdminProfile {
  id: number;
  nama_lengkap: string;
  username: string;
  email: string;
  is_super_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateProfileData {
  nama_lengkap: string;
  username: string;
  email: string;
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface DeleteAccountData {
  password: string;
}

export const settingsService = {
  // Get admin profile
  async getProfile(): Promise<AdminProfile> {
    const response = await api.get("/settings/profile");
    return response.data.data;
  },

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<AdminProfile> {
    const response = await api.put("/settings/profile", data);
    return response.data.data;
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.put("/settings/profile/password", data);
  },

  // Delete account
  async deleteAccount(data: DeleteAccountData): Promise<void> {
    await api.delete("/settings/profile", { data });
  },

  // Logout
  async logout(): Promise<void> {
    await api.post("/settings/profile/logout");
  },
};
