import { DateRange } from "@/lib/types";
import {
  format,
  isBefore,
  eachDayOfInterval,
  EachDayOfIntervalResult,
  isAfter,
} from "date-fns";
import { tz } from "@date-fns/tz";
import { convertUTC } from "./tzUtils";

type EachDay = EachDayOfIntervalResult<
  {
    start: string;
    end: string;
  },
  undefined
>;

function disabledTimeSlot(
  allDates: DateRange[],
  slotId: string,
  userTimezone: string
): boolean {
  if (allDates.length === 0) return false;

  return allDates.some(({ startTime, endTime }) => {
    const startDateUTC = convertUTC({ time: startTime, userTimezone });
    const endDateUTC = convertUTC({ time: endTime, userTimezone });

    return (
      (isBefore(slotId, startDateUTC) &&
        slotId.split("T")[0] === startDateUTC.split("T")[0]) ||
      (isAfter(slotId, endDateUTC) &&
        slotId.split("T")[0] === endDateUTC.split("T")[0])
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

  console.log("eachDays", dateList);

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
