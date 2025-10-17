// utils/date.ts

/**
 * Konversi dari string UTC (misal dari DB) ke format datetime-local untuk input.
 * Output: "YYYY-MM-DDTHH:mm" (WIB)
 */
export const formatUTCtoWIBForInput = (dateString: string | Date): string => {
  if (!dateString) return "";
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) return "";

  // Tambahkan offset +7 jam (UTC -> WIB)
  const wibOffset = 7 * 60 * 60 * 1000;
  const wibDate = new Date(date.getTime() + wibOffset);

  const year = wibDate.getUTCFullYear();
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wibDate.getUTCDate()).padStart(2, "0");
  const hours = String(wibDate.getUTCHours()).padStart(2, "0");
  const minutes = String(wibDate.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Konversi input dari datetime-local (WIB) ke UTC string (untuk backend)
 * Input: "YYYY-MM-DDTHH:mm" (WIB)
 * Output: ISO string UTC
 */
export const convertInputToUTC = (input: string): string => {
  if (!input) return "";

  // Buat date dari input (anggap input WIB)
  const [datePart, timePart] = input.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Buat date di UTC dengan mengurangi 7 jam
  const date = new Date(Date.UTC(year, month - 1, day, hours - 7, minutes));

  return date.toISOString(); // ISO string UTC
};
