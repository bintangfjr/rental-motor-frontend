// utils/date.ts - SOLUSI ROBUST untuk semua environment
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
      utcTime: date.getTime(),
      local: date.toLocaleString("id-ID"),
    });

    // ✅ METHOD 1: Manual calculation - PALING AMAN
    // Asumsikan date dari backend adalah UTC
    const utcTime = date.getTime();
    const wibOffset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
    const wibTime = utcTime + wibOffset;
    const wibDate = new Date(wibTime);

    // Format manually to avoid timezone issues
    const year = wibDate.getUTCFullYear(); // Use UTC methods because we manually calculated
    const month = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(wibDate.getUTCDate()).padStart(2, "0");
    const hours = String(wibDate.getUTCHours()).padStart(2, "0");
    const minutes = String(wibDate.getUTCMinutes()).padStart(2, "0");

    const result = `${year}-${month}-${day}T${hours}:${minutes}`;

    console.log("🕐 Format for input (METHOD 1 - Manual):", {
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

// ✅ ALTERNATIVE METHOD 2: Using toLocaleString with timezone
export const formatDateTimeForInputNoTZ_v2 = (
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

    // Use toLocaleString with Asia/Jakarta timezone
    const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    // Format using toLocaleString in en-US locale to get consistent format
    const year = wibDate.getFullYear();
    const month = String(wibDate.getMonth() + 1).padStart(2, "0");
    const day = String(wibDate.getDate()).padStart(2, "0");
    const hours = String(wibDate.getHours()).padStart(2, "0");
    const minutes = String(wibDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Error in formatDateTimeForInputNoTZ_v2:", error);
    return "";
  }
};

// ✅ Fungsi untuk konversi WIB ke UTC sebelum kirim ke backend
export const formatWIBToUTCForBackend = (wibDateTime: string): string => {
  if (!wibDateTime) return "";

  try {
    console.log("🕐 Converting WIB to UTC:", wibDateTime);

    // Parse the WIB datetime string
    const [datePart, timePart] = wibDateTime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    // Create date object in WIB (UTC+7)
    const wibDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    // Convert WIB to UTC by subtracting 7 hours
    const utcTime = wibDate.getTime() - 7 * 60 * 60 * 1000;
    const utcDate = new Date(utcTime);

    const result = utcDate.toISOString();

    console.log("🕐 WIB to UTC result:", {
      wib_input: wibDateTime,
      utc_output: result,
    });

    return result;
  } catch (error) {
    console.error("Error converting WIB to UTC:", error);
    return "";
  }
};
