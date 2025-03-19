// components/DatePicker.tsx
import React from "react";
import {
  format,
  addDays,
  isSameDay,
  startOfDay,
  startOfWeek,
  endOfDay,
  parseISO,
} from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

interface DatePickerProps {
  selectedDates: string[]; // 使用ISO字符串數組而不是Date對象
  onChange: (dates: string[]) => void; // 返回ISO字符串
  timezone: string;
}

export function DatePicker({
  selectedDates,
  onChange,
  timezone,
}: DatePickerProps) {
  // 轉換當前時間到選擇的時區
  const nowInTimezone = utcToZonedTime(new Date(), timezone);
  const todayInTimezone = startOfDay(nowInTimezone);
  const endOfTodayInTimezone = endOfDay(todayInTimezone);

  // 計算5週的日曆天數
  const firstDayOfCalendar = startOfWeek(todayInTimezone);
  const calendarDays = Array.from({ length: 35 }, (_, i) =>
    addDays(firstDayOfCalendar, i)
  );

  // 切換日期選擇
  const toggleDate = (date: Date) => {
    // 確保日期是在用戶時區的午夜時間
    const dateInTimezone = startOfDay(utcToZonedTime(date, timezone));

    // 檢查日期是否在過去
    const isPast = dateInTimezone < endOfTodayInTimezone;
    if (isPast) return;

    // 將時區日期轉換為UTC ISO字符串（僅保留日期部分）
    const dateInUTC = zonedTimeToUtc(dateInTimezone, timezone);
    const dateISOString = dateInUTC.toISOString().split("T")[0]; // 只保留 "YYYY-MM-DD" 部分

    // 檢查日期是否已被選擇
    const isSelected = selectedDates.some((isoStr) => {
      const dateObj = parseISO(isoStr);
      return isSameDay(utcToZonedTime(dateObj, timezone), dateInTimezone);
    });

    if (isSelected) {
      // 移除日期
      onChange(
        selectedDates.filter((isoStr) => {
          const dateObj = parseISO(isoStr);
          return !isSameDay(utcToZonedTime(dateObj, timezone), dateInTimezone);
        })
      );
    } else {
      // 添加日期
      onChange([...selectedDates, dateISOString]);
    }
  };

  // 按月份和年份分組日期
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
          {/* 星期幾標題 */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-gray-500 text-center p-2"
            >
              {day}
            </div>
          ))}

          {/* 日期按鈕 */}
          {monthDates.map((date) => {
            const dateInTimezone = utcToZonedTime(date, timezone);
            const isPast = dateInTimezone < endOfTodayInTimezone;

            // 檢查日期是否已被選擇
            const isSelected = selectedDates.some((isoStr) => {
              const dateObj = parseISO(isoStr);
              return isSameDay(
                utcToZonedTime(dateObj, timezone),
                dateInTimezone
              );
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

  return (
    <div className="space-y-6">
      {renderMonthCalendar(calendarDays)}
      <div className="text-xs text-gray-500">
        All dates are shown in your timezone ({timezone})
      </div>
    </div>
  );
}
