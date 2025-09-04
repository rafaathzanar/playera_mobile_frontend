/**
 * Date utility functions to ensure consistent date handling across the app
 * All dates are handled in UTC to avoid timezone issues
 */

/**
 * Get current date in YYYY-MM-DD format (UTC)
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDateUTC = () => {
  const now = new Date();
  // Use UTC methods to avoid timezone issues
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Convert a date string to YYYY-MM-DD format (UTC)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateUTC = (date) => {
  if (!date) return getCurrentDateUTC();

  let dateObj;
  if (typeof date === "string") {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return getCurrentDateUTC();
  }

  // Use UTC methods to avoid timezone conversion
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Get tomorrow's date in YYYY-MM-DD format (UTC)
 * @returns {string} Tomorrow's date in YYYY-MM-DD format
 */
export const getTomorrowDateUTC = () => {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return formatDateUTC(tomorrow);
};

/**
 * Get date N days from now in YYYY-MM-DD format (UTC)
 * @param {number} days - Number of days to add (can be negative)
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getDateFromNowUTC = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateUTC(date);
};

/**
 * Check if a date is today (UTC)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export const isTodayUTC = (dateString) => {
  return dateString === getCurrentDateUTC();
};

/**
 * Check if a date is tomorrow (UTC)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if the date is tomorrow
 */
export const isTomorrowUTC = (dateString) => {
  return dateString === getTomorrowDateUTC();
};

/**
 * Format date for display (local timezone for user-friendly display)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "N/A";

  try {
    // Create date object from YYYY-MM-DD string
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date for display:", error);
    return "Invalid Date";
  }
};

/**
 * Debug function to log date information
 * @param {string} label - Label for the log
 * @param {string} dateString - Date string to debug
 */
export const debugDate = (label, dateString) => {
  console.log(`=== DATE DEBUG: ${label} ===`);
  console.log("Input date string:", dateString);
  console.log("Current UTC date:", getCurrentDateUTC());
  console.log("Current local date:", new Date().toISOString().split("T")[0]);
  console.log("Formatted for display:", formatDateForDisplay(dateString));
  console.log("=== END DATE DEBUG ===");
};
