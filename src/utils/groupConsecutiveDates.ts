import { differenceInDays } from "date-fns";
import { getTzOffset } from "./tzUtils";
import { DateRange } from "@/lib/types";

/**
 * Groups consecutive dates from an unsorted array of date strings
 * @param {string[]} selectedDates - Array of date strings in 'yyyy-MM-dd' format
 * @returns {Array<{startDate: string, endDate: string}>} - Array of date range objects
 */
export function groupConsecutiveDates(
  selectedDates: string[],
  userTimezone: string
): DateRange[] {
  if (!selectedDates?.length) return [];

  const sortedDates = [...new Set(selectedDates)].sort();
  const tzOffset = getTzOffset(userTimezone);

  const result = [];
  let currentRange = {
    startTime: `${sortedDates[0]}T00:00:00.000${tzOffset}`,
    endTime: `${sortedDates[0]}T23:59:59.999${tzOffset}`,
  };

  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const previous = new Date(sortedDates[i - 1]);

    if (differenceInDays(current, previous) === 1) {
      currentRange.endTime = `${sortedDates[i]}T23:59:59.999${tzOffset}`;
    } else {
      result.push(currentRange);
      currentRange = {
        startTime: `${sortedDates[i]}T00:00:00.000${tzOffset}`,
        endTime: `${sortedDates[i]}T23:59:59.999${tzOffset}`,
      };
    }
  }

  result.push(currentRange);

  return result;
}
