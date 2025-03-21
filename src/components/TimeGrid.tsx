import { useState, useEffect } from "react";
import { parseISO, differenceInDays } from "date-fns";
import { generateTimeSlots } from "@/lib/utils";
import { useMeetingStore } from "@/store/meetingStore";

export function TimeGrid() {
  const [isDragging, setIsDragging] = useState(false);
  const { timeSlots, formatTime, formatDate } = generateTimeSlots();
  const { meeting, selectedSlots, toggleSlot } = useMeetingStore();
  const dates = meeting.dates || [];

  // Check if dates are consecutive and add spacing if needed
  const areDatesConsecutive = (date1: string, date2: string) => {
    const d1 = parseISO(date1);
    const d2 = parseISO(date2);
    return differenceInDays(d2, d1) === 1;
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

  const sortedDates = [...dates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

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
            {/* Empty corner cell */}
            <th className="border p-2 bg-gray-100"></th>

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
