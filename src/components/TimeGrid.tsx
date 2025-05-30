import { useState, useEffect, useMemo } from "react";
import { differenceInDays, format } from "date-fns";
import { useMeetingStore } from "@/store/meetingStore";
import {
  disabledTimeSlot,
  generateDate,
  generateTimeSlots,
} from "@/utils/generateTimeGrid";
import { convertHardTextTZ } from "@/utils/tzUtils";

export function TimeGrid() {
  const [isDragging, setIsDragging] = useState(false);
  const { meeting, selectedTZSlots, userTimezone, toggleSlot } =
    useMeetingStore();

  const displayDates = useMemo(
    () => generateDate(meeting.dates, userTimezone),
    [meeting.dates, userTimezone]
  );
  const timeSlots = useMemo(() => generateTimeSlots(), []);

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
    const isSelect = selectedTZSlots.includes(slotId);
    toggleSlot({ slotId, isSelect });
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

            {displayDates.map((date, index) => {
              // Add spacing class if current date is not consecutive with previous
              const needsSpacing =
                index > 0 &&
                differenceInDays(date, displayDates[index - 1]) > 1;

              return (
                <th
                  key={index}
                  className={`border p-2 text-center font-medium bg-gray-100 ${
                    needsSpacing ? "border-l-4 border-l-gray-300" : ""
                  }`}
                >
                  {format(date, "MMM d, EEE")}
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
                {minute === "00" ? `${hour}:${minute}` : ""}
              </td>

              {/* Slots for each date */}
              {displayDates.map((date, index) => {
                const slotId = convertHardTextTZ({
                  time: `${date}T${hour}:${minute}:00.000Z`,
                  userTimezone,
                });
                const isSelected = selectedTZSlots.includes(slotId);
                const isDisabled = disabledTimeSlot(meeting.dates, slotId);

                // Add spacing class if current date is not consecutive with previous
                const needsSpacing =
                  index > 0 &&
                  differenceInDays(date, displayDates[index - 1]) > 1;

                return (
                  <td
                    key={`${date}-${hour}-${minute}`}
                    className={`border p-0 ${
                      needsSpacing ? "border-l-4 border-l-gray-300" : ""
                    }`}
                  >
                    <div
                      className={`
                        w-full h-8 
												${
                          isDisabled
                            ? "bg-gray-200 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            : "bg-white hover:bg-gray-50 cursor-pointer"
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
