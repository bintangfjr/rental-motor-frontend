// utils/date.ts - PERBAIKI dengan konversi UTC->WIB
export const formatDateTimeForInputNoTZ = (
  dateString: string | Date
): string => {
  if (!dateString) return "";

  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      console.error("Invalid date for input:", dateString);
      return "";
    }

    console.log("🕐 DEBUG formatDateTimeForInputNoTZ:", {
      input: dateString,
      utc: date.toISOString(),
      local: date.toLocaleString("id-ID"),
    });

    // ✅ KONVERSI UTC ke WIB untuk datetime-local input
    // Karena database menyimpan UTC, tapi kita mau edit sebagai WIB
    const wibOffset = 7 * 60 * 60 * 1000; // UTC+7
    const wibDate = new Date(date.getTime() + wibOffset);

    // ✅ GUNAKAN getHours(), getDate(), BUKAN getUTCHours(), getUTCDate()
    // Karena wibDate sudah dalam waktu lokal (WIB)
    const year = wibDate.getFullYear();
    const month = String(wibDate.getMonth() + 1).padStart(2, "0");
    const day = String(wibDate.getDate()).padStart(2, "0");
    const hours = String(wibDate.getHours()).padStart(2, "0");
    const minutes = String(wibDate.getMinutes()).padStart(2, "0");

    const result = `${year}-${month}-${day}T${hours}:${minutes}`;

    console.log("🕐 Format for input (UTC->WIB):", {
      input: dateString,
      utc_time: date.toISOString(),
      wib_time: wibDate.toISOString(),
      wib_display: result,
      wib_hours: wibDate.getHours(),
      wib_minutes: wibDate.getMinutes(),
    });

    return result;
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};

// ✅ Fungsi untuk konversi WIB ke UTC sebelum kirim ke backend
export const formatWIBToUTCForBackend = (wibDateTime: string): string => {
  if (!wibDateTime) return "";

  try {
    // Parse tanggal dari input WIB
    const wibDate = new Date(wibDateTime);

    // Konversi WIB ke UTC (kurangi 7 jam)
    const utcDate = new Date(wibDate.getTime() - 7 * 60 * 60 * 1000);

    // Format ke ISO string untuk backend
    return utcDate.toISOString();
  } catch (error) {
    console.error("Error converting WIB to UTC:", error);
    return "";
  }
};
