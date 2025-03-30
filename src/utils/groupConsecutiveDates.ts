import { differenceInDays } from "date-fns";

/**
 * Groups consecutive dates from an unsorted array of date strings
 * @param {string[]} selectedDates - Array of date strings in 'yyyy-MM-dd' format
 * @returns {Array<{startDate: string, endDate: string}>} - Array of date range objects
 */
export function groupConsecutiveDates(selectedDates: string[]) {
  if (!selectedDates?.length) return [];

  const sortedDates = [...new Set(selectedDates)].sort();

  const result = [];
  let currentRange = {
    startDate: `${sortedDates[0]}T00:00:00`,
    endDate: `${sortedDates[0]}T23:59:59.999`,
  };

  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const previous = new Date(sortedDates[i - 1]);

    if (differenceInDays(current, previous) === 1) {
      currentRange.endDate = `${sortedDates[i]}T23:59:59.999`;
    } else {
      result.push(currentRange);
      currentRange = {
        startDate: `${sortedDates[i]}T00:00:00`,
        endDate: `${sortedDates[i]}T23:59:59.999`,
      };
    }
  }

  result.push(currentRange);

  return result;
}
