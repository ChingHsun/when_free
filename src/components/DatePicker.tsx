import {
  format,
  addDays,
  isSameDay,
  startOfDay,
  startOfWeek,
  parseISO,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { WEEK_DAYS } from "@/lib/constants";

interface DatePickerProps {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  timezone: string;
}

export function DatePicker({
  selectedDates,
  onChange,
  timezone,
}: DatePickerProps) {
  const nowInTimezone = utcToZonedTime(new Date(), timezone);
  const todayInTimezone = startOfDay(nowInTimezone);

  const firstDayOfCalendar = startOfWeek(todayInTimezone);
  const calendarDays = Array.from({ length: 35 }, (_, i) =>
    addDays(firstDayOfCalendar, i)
  );

  const toggleDate = (selectedDate: Date) => {
    const dateStringsSet = new Set(selectedDates);
    const selectedDateISO = selectedDate.toISOString();

    if (dateStringsSet.has(selectedDateISO)) {
      dateStringsSet.delete(selectedDateISO);
    } else {
      dateStringsSet.add(selectedDateISO);
    }

    onChange(Array.from(dateStringsSet));
  };

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
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-gray-500 text-center p-2"
            >
              {day}
            </div>
          ))}

          {/* date button */}
          {monthDates.map((date) => {
            const isPast = date < todayInTimezone;

            const isSelected = selectedDates.some((isoStr) => {
              const dateObj = parseISO(isoStr);
              return isSameDay(dateObj, date);
            });

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
                  {format(date, "d")}
                  <div className="text-[10px] mt-0.5">
                    {format(date, "EEE")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {renderMonthCalendar(calendarDays)}
      <div className="text-xs text-gray-500">
        All dates are shown in your timezone ({timezone})
      </div>
    </div>
  );
}
