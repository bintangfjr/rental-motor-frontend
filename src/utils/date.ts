// utils/date.ts

/**
 * Convert datetime-local string to WIB ISO string
 * Format input: "2024-01-15T10:30" (datetime-local)
 * Format output: "2024-01-15T10:30:00+07:00" (WIB ISO)
 */
export const convertToWIBISOString = (datetimeLocal: string): string => {
  if (!datetimeLocal) return "";

  try {
    // datetimeLocal format: "2024-01-15T10:30"
    // Create date object - akan diinterpretasikan sebagai local time
    const localDate = new Date(datetimeLocal);

    if (isNaN(localDate.getTime())) {
      console.error("Invalid date:", datetimeLocal);
      return "";
    }

    // Manual construction untuk WIB timezone (+7)
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    const wibISOString = `${year}-${month}-${day}T${hours}:${minutes}:00+07:00`;

    console.log("Date conversion:", {
      input: datetimeLocal,
      output: wibISOString,
      localDate: localDate.toString(),
    });

    return wibISOString;
  } catch (error) {
    console.error("Error converting date:", error);
    return "";
  }
};

/**
 * Format date string for datetime-local input
 * Format input: "2024-01-15T10:30:00+07:00" (ISO with timezone)
 * Format output: "2024-01-15T10:30" (datetime-local)
 */
export const formatDateTimeForInputNoTZ = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date for input:", dateString);
      return "";
    }

    // Convert ke local time untuk datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};

/**
 * Convert date to WIB ISO string for selesai sewa
 */
export const convertDateToWIBISO = (date: Date | string): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date for WIB conversion:", date);
      return "";
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
  } catch (error) {
    console.error("Error converting date to WIB:", error);
    return "";
  }
};
