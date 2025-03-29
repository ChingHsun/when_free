import { useState, useEffect } from "react";
import { differenceInDays, format } from "date-fns";
import { generateTimeSlots } from "@/lib/utils";
import { useMeetingStore } from "@/store/meetingStore";
import { DateRange } from "@/lib/types";

export function TimeGrid() {
  const [isDragging, setIsDragging] = useState(false);
  const { timeSlots, formatTime } = generateTimeSlots();
  const { meeting, selectedSlots, toggleSlot } = useMeetingStore();

  // Check if dates are consecutive and add spacing if needed
  const areDatesConsecutive = (date1: DateRange, date2: DateRange) => {
    return (
      differenceInDays(new Date(date2.startTime), new Date(date1.startTime)) ===
      1
    );
  };

  const handleMouseDown = (slotId: string) => {
    setIsDragging(true);
    updateSlotSelection(slotId);
  };

  const handleMouseEnter = (slotId: string) => {
    if (isDragging) {
      updateSlotSelection(slotId);
    }
  };

  const updateSlotSelection = (slotId: string) => {
    const isSelect = selectedSlots.includes(slotId);
    toggleSlot({ isSelect, slotId });
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse select-none">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100"></th>

            {meeting.dates.map((date, index) => {
              // Add spacing class if current date is not consecutive with previous
              const needsSpacing =
                index > 0 &&
                !areDatesConsecutive(meeting.dates[index - 1], date);

              return (
                <th
                  key={index}
                  className={`border p-2 text-center font-medium bg-gray-100 ${
                    needsSpacing ? "border-l-4 border-l-gray-300" : ""
                  }`}
                >
                  {format(new Date(date.startTime), "MMM d, EEE")}
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
              {meeting.dates.map((date, index) => {
                const slotId = `${date}_${hour}_${minute}`;
                const isSelected = selectedSlots.includes(slotId);

                // Add spacing class if current date is not consecutive with previous
                const needsSpacing =
                  index > 0 &&
                  !areDatesConsecutive(meeting.dates[index - 1], date);

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
                      onMouseEnter={() => handleMouseEnter(slotId)}
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
