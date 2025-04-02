import { DateRange } from "@/lib/types";
import {
  format,
  isBefore,
  eachDayOfInterval,
  EachDayOfIntervalResult,
  isAfter,
} from "date-fns";
import { tz } from "@date-fns/tz";

type EachDay = EachDayOfIntervalResult<
  {
    start: string;
    end: string;
  },
  undefined
>;

function disabledTimeSlot(allDates: DateRange[], slotId: string): boolean {
  if (allDates.length === 0) return false;

  return allDates.some(({ startTime, endTime }) => {
    return (
      (isBefore(slotId, startTime) &&
        slotId.split("T")[0] === startTime.split("T")[0]) ||
      (isAfter(slotId, endTime) &&
        slotId.split("T")[0] === endTime.split("T")[0])
    );
  });
}

/**
 * Generates an array of dates in "MM-dd" format from the provided date ranges.
 *
 * @param allDates Array of date ranges to process
 * @returns Array of unique dates in "MM-dd" format
 */
function generateDate(allDates: DateRange[], userTimezone: string) {
  if (allDates.length === 0) return [];

  let dateList: EachDay = [];

  allDates.forEach(({ startTime, endTime }) => {
    const eachDays = eachDayOfInterval(
      {
        start: startTime,
        end: endTime,
      },
      { in: tz(userTimezone) }
    );

    dateList = [...dateList, ...eachDays];
  });

  return dateList.map((date) => format(date, "yyyy-MM-dd"));
}

const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      timeSlots.push({
        hour: hour.toString().padStart(2, "0"),
        minute: minute.toString().padStart(2, "0"),
      });
    }
  }

  return timeSlots;
};

export { disabledTimeSlot, generateDate, generateTimeSlots };
