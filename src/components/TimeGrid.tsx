import React, { useState, useEffect } from "react";
import { format, parseISO, differenceInDays } from "date-fns";

interface TimeGridProps {
  dates: string[];
  selectedSlots: string[];
  onSlotToggle: (slotId: string) => void;
  onMouseDown: (slotId: string) => void;
  onMouseEnter: (slotId: string) => void;
}

export function TimeGrid({
  dates,
  selectedSlots,
  onSlotToggle,
  onMouseDown,
  onMouseEnter,
}: TimeGridProps) {
  // Generate time slots for 24 hours in 30-minute increments (from 0:00 to 23:30)
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      timeSlots.push({ hour, minute });
    }
  }

  // Format time for display (24-hour format)
  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "EEE, MMM d");
  };

  // Check if dates are consecutive and add spacing if needed
  const areDatesConsecutive = (date1: string, date2: string) => {
    const d1 = parseISO(date1);
    const d2 = parseISO(date2);
    return differenceInDays(d2, d1) === 1;
  };

  // Add global prevention of text selection during drag
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Disable text selection globally when dragging
    if (isDragging) {
      document.body.classList.add("select-none");
    } else {
      document.body.classList.remove("select-none");
    }

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove("select-none");
    };
  }, [isDragging]);

  // Override mouse down/up handlers to manage dragging state
  const handleMouseDown = (slotId: string) => {
    setIsDragging(true);
    onMouseDown(slotId);
  };

  const handleGlobalMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Sort dates chronologically
  const sortedDates = [...dates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {/* Empty corner cell */}
            <th className="border p-2 bg-gray-100"></th>

            {/* Date headers with spacing for non-consecutive dates */}
            {sortedDates.map((date, index) => {
              // Add spacing class if current date is not consecutive with previous
              const needsSpacing =
                index > 0 && !areDatesConsecutive(sortedDates[index - 1], date);

              return (
                <th
                  key={date}
                  className={`border p-2 text-center font-medium bg-gray-100 ${
                    needsSpacing ? "border-l-4 border-l-gray-300" : ""
                  }`}
                >
                  {formatDate(date)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Time slots grid */}
          {timeSlots.map(({ hour, minute }) => (
            <tr key={`${hour}-${minute}`}>
              {/* Time label - only show labels for full hours */}
              <td className="border p-2 text-sm text-gray-600 bg-gray-100 font-medium">
                {minute === 0 ? formatTime(hour, 0) : ""}
              </td>

              {/* Slots for each date */}
              {sortedDates.map((date, index) => {
                const slotId = `${date}_${hour}_${minute}`;
                const isSelected = selectedSlots.includes(slotId);

                // Add spacing class if current date is not consecutive with previous
                const needsSpacing =
                  index > 0 &&
                  !areDatesConsecutive(sortedDates[index - 1], date);

                return (
                  <td
                    key={`${date}-${hour}-${minute}`}
                    className={`border p-0 ${
                      needsSpacing ? "border-l-4 border-l-gray-300" : ""
                    }`}
                  >
                    <div
                      className={`
                        w-full h-8 cursor-pointer
                        ${
                          isSelected
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-white hover:bg-gray-50"
                        }
                      `}
                      onMouseDown={() => handleMouseDown(slotId)}
                      onMouseEnter={() => onMouseEnter(slotId)}
                    ></div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
