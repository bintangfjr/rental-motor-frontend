// utils/date.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const WIB_TZ = "Asia/Jakarta";

/**
 * Format untuk input datetime-local dari string UTC
 * DB menyimpan UTC, frontend butuh WIB
 */
export const formatDateTimeForInputNoTZ = (
  utcString: string | Date
): string => {
  if (!utcString) return "";
  try {
    const wibDate = dayjs(utcString).tz(WIB_TZ);
    return wibDate.format("YYYY-MM-DDTHH:mm"); // untuk <input type="datetime-local">
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};

/**
 * Convert input datetime-local (WIB) → UTC string untuk backend/DB
 */
export const convertInputToUTC = (localString: string): string => {
  if (!localString) return "";
  try {
    const utcDate = dayjs.tz(localString, WIB_TZ).utc();
    return utcDate.toISOString();
  } catch (error) {
    console.error("Error converting local input to UTC:", error);
    return "";
  }
};
