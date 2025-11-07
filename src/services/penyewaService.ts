import api from "./api";
import {
  Penyewa,
  CreatePenyewaData,
  UpdatePenyewaData,
  HistorySewa,
  HistoryStats,
} from "../types/penyewa";

// Helper functions
const getLocalPenyewas = (): Penyewa[] => {
  try {
    const localData = localStorage.getItem("penyewas");
    return localData ? JSON.parse(localData) : [];
  } catch (error) {
    console.error("Error reading local penyewas:", error);
    return [];
  }
};

const saveLocalPenyewas = (penyewas: Penyewa[]): void => {
  try {
    localStorage.setItem("penyewas", JSON.stringify(penyewas));
  } catch (error) {
    console.error("Error saving local penyewas:", error);
  }
};

// Helper untuk check jika string adalah base64 image
const isBase64Image = (str: unknown): str is string => {
  return typeof str === "string" && str.startsWith("data:image");
};

// Helper untuk handle error
const handleServiceError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof Error) {
    throw error;
  } else {
    throw new Error(defaultMessage);
  }
};

export const penyewaService = {
  // Get all penyewas
  async getAll(): Promise<Penyewa[]> {
    try {
      const response = await api.get("/penyewas");
      const apiPenyewas = response.data.data || [];

      if (apiPenyewas.length > 0) {
        saveLocalPenyewas(apiPenyewas);
        return apiPenyewas;
      }

      return getLocalPenyewas();
    } catch (error) {
      console.error(
        "Error fetching penyewas from API, using local data:",
        error
      );
      return getLocalPenyewas();
    }
  },

  // Get single penyewa by ID
  async getById(id: number): Promise<Penyewa> {
    try {
      const response = await api.get(`/penyewas/${id}`);
      const apiPenyewa = response.data.data;

      if (apiPenyewa) {
        const localPenyewas = getLocalPenyewas();
        const filteredPenyewas = localPenyewas.filter((p) => p.id !== id);
        const updatedPenyewas = [...filteredPenyewas, apiPenyewa];
        saveLocalPenyewas(updatedPenyewas);

        return apiPenyewa;
      }

      throw new Error(`Penyewa dengan ID ${id} tidak ditemukan`);
    } catch (error) {
      console.error(
        `Error fetching penyewa with ID ${id} from API, trying local:`,
        error
      );

      const localPenyewas = getLocalPenyewas();
      const localPenyewa = localPenyewas.find((p) => p.id === id);

      if (localPenyewa) {
        return localPenyewa;
      }

      throw new Error(`Penyewa dengan ID ${id} tidak ditemukan`);
    }
  },

  // ✅ METHOD BARU: Get History Sewa by Penyewa ID
  async getPenyewaHistory(penyewaId: number): Promise<HistorySewa[]> {
    try {
      const response = await api.get(`/penyewas/${penyewaId}/history`);
      return response.data.data || [];
    } catch (error) {
      console.error(
        `Error fetching history for penyewa ID ${penyewaId}:`,
        error
      );

      // Fallback: return empty array instead of throwing error
      // karena history tidak disimpan secara lokal
      return [];
    }
  },

  // ✅ METHOD BARU: Get Statistik History Sewa
  async getPenyewaHistoryStats(penyewaId: number): Promise<HistoryStats> {
    try {
      const response = await api.get(`/penyewas/${penyewaId}/history/stats`);
      return (
        response.data.data || {
          totalSewa: 0,
          totalPendapatan: 0,
          totalDenda: 0,
          sewaSelesai: 0,
          sewaDenda: 0,
          keterlambatanTotal: 0,
          rataRataDenda: 0,
        }
      );
    } catch (error) {
      console.error(
        `Error fetching history stats for penyewa ID ${penyewaId}:`,
        error
      );

      // Return default stats jika error
      return {
        totalSewa: 0,
        totalPendapatan: 0,
        totalDenda: 0,
        sewaSelesai: 0,
        sewaDenda: 0,
        keterlambatanTotal: 0,
        rataRataDenda: 0,
      };
    }
  },

  // Create new penyewa
  async create(data: CreatePenyewaData): Promise<Penyewa> {
    try {
      const formData = new FormData();
      formData.append("nama", data.nama);
      formData.append("alamat", data.alamat || "");
      formData.append("no_whatsapp", data.no_whatsapp);

      // Handle foto_ktp dengan type safety
      if (data.foto_ktp) {
        if (isBase64Image(data.foto_ktp)) {
          // Convert base64 to blob
          const response = await fetch(data.foto_ktp);
          const blob = await response.blob();
          formData.append("foto_ktp", blob, "foto_ktp.jpg");
        } else if (data.foto_ktp instanceof File) {
          // Langsung append file
          formData.append("foto_ktp", data.foto_ktp);
        }
      }

      const response = await api.post("/penyewas", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newPenyewa = response.data.data;

      if (!newPenyewa) {
        throw new Error(
          "Gagal membuat penyewa - tidak ada data yang dikembalikan"
        );
      }

      const existingPenyewas = getLocalPenyewas();
      const updatedPenyewas = [...existingPenyewas, newPenyewa];
      saveLocalPenyewas(updatedPenyewas);

      return newPenyewa;
    } catch (error: unknown) {
      console.error("Error creating penyewa:", error);

      // Fallback: create temporary local data
      const tempPenyewa: Penyewa = {
        id: Date.now(),
        nama: data.nama,
        alamat: data.alamat || "",
        no_whatsapp: data.no_whatsapp,
        foto_ktp: typeof data.foto_ktp === "string" ? data.foto_ktp : undefined,
        is_blacklisted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sewas_aktif_count: 0,
        _isTemp: true,
      };

      const existingPenyewas = getLocalPenyewas();
      const updatedPenyewas = [...existingPenyewas, tempPenyewa];
      saveLocalPenyewas(updatedPenyewas);

      return tempPenyewa;
    }
  },

  // Update penyewa
  async update(id: number, data: UpdatePenyewaData): Promise<Penyewa> {
    try {
      const formData = new FormData();
      if (data.nama) formData.append("nama", data.nama);
      if (data.alamat !== undefined) formData.append("alamat", data.alamat);
      if (data.no_whatsapp) formData.append("no_whatsapp", data.no_whatsapp);

      // Handle foto_ktp update dengan type safety
      if (data.foto_ktp !== undefined) {
        if (data.foto_ktp === null) {
          // Explicitly set to null to remove foto
          formData.append("foto_ktp", "");
        } else if (isBase64Image(data.foto_ktp)) {
          // Convert base64 to blob
          const response = await fetch(data.foto_ktp);
          const blob = await response.blob();
          formData.append("foto_ktp", blob, "foto_ktp.jpg");
        } else if (data.foto_ktp instanceof File) {
          // Langsung append file
          formData.append("foto_ktp", data.foto_ktp);
        }
      }

      const response = await api.put(`/penyewas/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedPenyewa = response.data.data;

      if (!updatedPenyewa) {
        throw new Error(
          "Gagal mengupdate penyewa - tidak ada data yang dikembalikan"
        );
      }

      const existingPenyewas = getLocalPenyewas();
      const updatedPenyewas = existingPenyewas.map((p) =>
        p.id === id
          ? { ...updatedPenyewa, updated_at: new Date().toISOString() }
          : p
      );
      saveLocalPenyewas(updatedPenyewas);

      return updatedPenyewa;
    } catch (error: unknown) {
      console.error(`Error updating penyewa with ID ${id}:`, error);

      const existingPenyewas = getLocalPenyewas();
      const index = existingPenyewas.findIndex((p) => p.id === id);

      if (index === -1) {
        throw new Error(`Penyewa dengan ID ${id} tidak ditemukan`);
      }

      const updatedPenyewa: Penyewa = {
        ...existingPenyewas[index],
        ...data,
        foto_ktp:
          data.foto_ktp && typeof data.foto_ktp === "string"
            ? data.foto_ktp
            : existingPenyewas[index].foto_ktp,
        updated_at: new Date().toISOString(),
        _needsSync: true,
      };

      existingPenyewas[index] = updatedPenyewa;
      saveLocalPenyewas(existingPenyewas);

      return updatedPenyewa;
    }
  },

  // Toggle blacklist status
  async toggleBlacklist(id: number): Promise<Penyewa> {
    try {
      const response = await api.put(`/penyewas/${id}/blacklist`);
      const updatedPenyewa = response.data.data;

      if (!updatedPenyewa) {
        throw new Error(
          "Gagal mengubah status blacklist - tidak ada data yang dikembalikan"
        );
      }

      const existingPenyewas = getLocalPenyewas();
      const updatedPenyewas = existingPenyewas.map((p) =>
        p.id === id ? updatedPenyewa : p
      );
      saveLocalPenyewas(updatedPenyewas);

      return updatedPenyewa;
    } catch (error: unknown) {
      console.error(`Error toggling blacklist for penyewa ID ${id}:`, error);

      const existingPenyewas = getLocalPenyewas();
      const index = existingPenyewas.findIndex((p) => p.id === id);

      if (index === -1) {
        throw new Error(`Penyewa dengan ID ${id} tidak ditemukan`);
      }

      const updatedPenyewa: Penyewa = {
        ...existingPenyewas[index],
        is_blacklisted: !existingPenyewas[index].is_blacklisted,
        updated_at: new Date().toISOString(),
        _needsSync: true,
      };

      existingPenyewas[index] = updatedPenyewa;
      saveLocalPenyewas(existingPenyewas);

      return updatedPenyewa;
    }
  },

  // Delete penyewa
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/penyewas/${id}`);

      const existingPenyewas = getLocalPenyewas();
      const filteredPenyewas = existingPenyewas.filter((p) => p.id !== id);
      saveLocalPenyewas(filteredPenyewas);
    } catch (error: unknown) {
      console.error(`Error deleting penyewa with ID ${id}:`, error);

      const existingPenyewas = getLocalPenyewas();
      const filteredPenyewas = existingPenyewas.filter((p) => p.id !== id);

      if (filteredPenyewas.length === existingPenyewas.length) {
        throw new Error(`Penyewa dengan ID ${id} tidak ditemukan`);
      }

      saveLocalPenyewas(filteredPenyewas);

      throw new Error("Gagal menghapus penyewa (data dihapus secara lokal)");
    }
  },

  // Search penyewa by name or phone number
  async search(query: string): Promise<Penyewa[]> {
    try {
      const allPenyewas = await this.getAll();
      const lowerQuery = query.toLowerCase();

      return allPenyewas.filter(
        (penyewa) =>
          penyewa.nama.toLowerCase().includes(lowerQuery) ||
          penyewa.no_whatsapp.includes(query)
      );
    } catch (error) {
      console.error("Error searching penyewas:", error);
      return [];
    }
  },

  // Get penyewa statistics
  async getStats(): Promise<{
    total: number;
    blacklisted: number;
    withActiveRental: number;
  }> {
    try {
      const allPenyewas = await this.getAll();

      return {
        total: allPenyewas.length,
        blacklisted: allPenyewas.filter((p) => p.is_blacklisted).length,
        withActiveRental: allPenyewas.filter(
          (p) => p.sewas_aktif_count && p.sewas_aktif_count > 0
        ).length,
      };
    } catch (error) {
      console.error("Error getting penyewa stats:", error);
      return {
        total: 0,
        blacklisted: 0,
        withActiveRental: 0,
      };
    }
  },

  // Sync dengan API
  async syncWithAPI(): Promise<void> {
    try {
      const response = await api.get("/penyewas");
      const apiPenyewas = response.data.data || [];

      if (apiPenyewas.length > 0) {
        saveLocalPenyewas(apiPenyewas);
        console.log("Successfully synced penyewas with API");
      }
    } catch (error) {
      console.error("Error syncing with API:", error);
      throw new Error("Gagal menyinkronisasi data dengan server");
    }
  },

  // Sync pending changes
  async syncPendingChanges(): Promise<void> {
    try {
      const localPenyewas = getLocalPenyewas();
      const pendingPenyewas = localPenyewas.filter(
        (p) => p._isTemp || p._needsSync
      );

      for (const penyewa of pendingPenyewas) {
        try {
          if (penyewa._isTemp) {
            const createData: CreatePenyewaData = {
              nama: penyewa.nama,
              alamat: penyewa.alamat,
              no_whatsapp: penyewa.no_whatsapp,
              foto_ktp: penyewa.foto_ktp || undefined,
            };
            await this.create(createData);
          } else if (penyewa._needsSync) {
            const updateData: UpdatePenyewaData = {
              nama: penyewa.nama,
              alamat: penyewa.alamat,
              no_whatsapp: penyewa.no_whatsapp,
              foto_ktp: penyewa.foto_ktp || undefined,
              is_blacklisted: penyewa.is_blacklisted,
            };
            await this.update(penyewa.id, updateData);
          }
        } catch (error) {
          console.error(`Failed to sync penyewa ${penyewa.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error syncing pending changes:", error);
      throw new Error("Gagal menyinkronisasi perubahan lokal");
    }
  },

  // Clear local data
  clearLocalData(): void {
    try {
      localStorage.removeItem("penyewas");
      console.log("Local penyewa data cleared");
    } catch (error) {
      console.error("Error clearing local data:", error);
    }
  },

  // Get pending changes count
  getPendingChangesCount(): number {
    const localPenyewas = getLocalPenyewas();
    return localPenyewas.filter((p) => p._isTemp || p._needsSync).length;
  },

  // Export penyewa data
  exportData(): string {
    const localPenyewas = getLocalPenyewas();
    return JSON.stringify(localPenyewas, null, 2);
  },

  // Import penyewa data
  importData(jsonData: string): void {
    try {
      const importedPenyewas: Penyewa[] = JSON.parse(jsonData);
      saveLocalPenyewas(importedPenyewas);
      console.log("Successfully imported penyewa data");
    } catch (error) {
      console.error("Error importing penyewa data:", error);
      throw new Error("Gagal mengimpor data penyewa");
    }
  },
};
