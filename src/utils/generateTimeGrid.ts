import { DateRange } from "@/lib/types";
import {
  format,
  isBefore,
  isSameDay,
  eachDayOfInterval,
  EachDayOfIntervalResult,
  isAfter,
} from "date-fns";
import { TZDate } from "@date-fns/tz";

function disabledTimeSlot(allDates: DateRange[], slotId: string): boolean {
  if (allDates.length === 0) return false;

  const slotDate = new TZDate(slotId, "UTC");
  return allDates.some(({ startTime, endTime }) => {
    const startDate = new TZDate(startTime, "UTC");
    const endDate = new TZDate(endTime, "UTC");

    return (
      (isBefore(slotDate, startDate) && isSameDay(slotDate, startDate)) ||
      (isAfter(slotDate, endDate) && isSameDay(slotDate, endDate))
    );
  });
}

type EachDay = EachDayOfIntervalResult<
  {
    start: TZDate;
    end: TZDate;
  },
  undefined
>;
/**
 * Generates an array of dates in "MM-dd" format from the provided date ranges.
 *
 * @param allDates Array of date ranges to process
 * @returns Array of unique dates in "MM-dd" format
 */
function generateDate(allDates: DateRange[]) {
  if (allDates.length === 0) return [];

  let dateList: EachDay = [];

  allDates.forEach(({ startTime, endTime }) => {
    // date-fns mostly return the system timezone, if you don't define
    const startDate = new TZDate(startTime, "UTC");
    const endDate = new TZDate(endTime, "UTC");

    const eachDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    dateList = [...dateList, ...eachDays];
  });

  return dateList.map((date) => format(date, "MM-dd"));
}

export { disabledTimeSlot, generateDate };
