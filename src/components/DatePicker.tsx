// components/DatePicker.tsx
import React from "react";
import {
  format,
  addDays,
  isSameDay,
  startOfDay,
  startOfWeek,
  endOfDay,
} from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

interface DatePickerProps {
  selectedDates: Date[];
  onChange: (dates: Date[]) => void;
  timezone: string;
}

export function DatePicker({
  selectedDates,
  onChange,
  timezone,
}: DatePickerProps) {
  // Convert current time to the selected timezone
  const nowInTimezone = utcToZonedTime(new Date(), timezone);
  const todayInTimezone = startOfDay(nowInTimezone);
  const endOfTodayInTimezone = endOfDay(todayInTimezone);

  // Calculate 5 weeks worth of days, showing multiple months
  const firstDayOfCalendar = startOfWeek(todayInTimezone);

  // Generate calendar days for the first month (current month)
  const calendarDays = Array.from({ length: 35 }, (_, i) =>
    addDays(firstDayOfCalendar, i)
  );

  const toggleDate = (date: Date) => {
    // Convert the selected date to UTC for storage
    const dateInTimezone = utcToZonedTime(date, timezone);

    // Check if the date is in the past (including today if it's past end of day)
    const isPast = dateInTimezone < endOfTodayInTimezone;
    if (isPast) return;

    const dateInUTC = zonedTimeToUtc(dateInTimezone, timezone);
    const isSelected = selectedDates.some((d) =>
      isSameDay(utcToZonedTime(d, timezone), dateInTimezone)
    );

    if (isSelected) {
      onChange(
        selectedDates.filter(
          (d) => !isSameDay(utcToZonedTime(d, timezone), dateInTimezone)
        )
      );
    } else {
      onChange([...selectedDates, dateInUTC]);
    }
  };

  // Group dates by month and year
  const renderMonthCalendar = (dates: Date[]) => {
    const dateGroups = dates.reduce<Record<string, Date[]>>((acc, date) => {
      const key = format(date, "MMMM yyyy");
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(date);
      return acc;
    }, {});

    return Object.entries(dateGroups).map(([monthYear, monthDates]) => (
      <div key={monthYear} className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">{monthYear}</h3>
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-gray-500 text-center p-2"
            >
              {day}
            </div>
          ))}

          {/* Date buttons */}
          {monthDates.map((date) => {
            const dateInTimezone = utcToZonedTime(date, timezone);
            const isPast = dateInTimezone < endOfTodayInTimezone;
            const isSelected = selectedDates.some((d) =>
              isSameDay(utcToZonedTime(d, timezone), dateInTimezone)
            );

            return (
              <button
                key={date.toISOString()}
                onClick={() => toggleDate(date)}
                disabled={isPast}
                className={`
                  p-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isPast
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                  }
                `}
              >
                <div className="text-center">
                  {format(dateInTimezone, "d")}
                  <div className="text-[10px] mt-0.5">
                    {format(dateInTimezone, "EEE")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ));
  };

  return <div className="space-y-6">{renderMonthCalendar(calendarDays)}</div>;
}
