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

    // Format ke datetime-local: "YYYY-MM-DDTHH:mm"
    const year = wibDate.getUTCFullYear();
    const month = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(wibDate.getUTCDate()).padStart(2, "0");
    const hours = String(wibDate.getUTCHours()).padStart(2, "0");
    const minutes = String(wibDate.getUTCMinutes()).padStart(2, "0");

    const result = `${year}-${month}-${day}T${hours}:${minutes}`;

    console.log("🕐 Format for input (UTC->WIB):", {
      input: dateString,
      utc_time: date.toISOString(),
      wib_time: wibDate.toISOString(),
      wib_display: result,
    });

    return result;
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};
