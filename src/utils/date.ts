// utils/date.ts - PERBAIKI
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

    // ✅ KONVERSI: Tangani timezone offset
    // Karena new Date() menginterpretasi database time sebagai UTC
    const timezoneOffset = date.getTimezoneOffset() * 60 * 1000; // offset dalam ms
    const localDate = new Date(date.getTime() + timezoneOffset);

    // Format ke datetime-local: "YYYY-MM-DDTHH:mm"
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    const result = `${year}-${month}-${day}T${hours}:${minutes}`;

    console.log("🕐 Format for input (Timezone fix):", {
      input: dateString,
      original: date.toISOString(),
      local: result,
      timezoneOffset: timezoneOffset / (60 * 1000), // dalam menit
    });

    return result;
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};
