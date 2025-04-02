import React, { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import {
  disabledTimeSlot,
  generateDate,
  generateTimeSlots,
} from "@/utils/generateTimeGrid";
import { useMeetingStore } from "@/store/meetingStore";
import { convertTZ } from "@/utils/tzUtils";

export function GroupAvailabilityGrid() {
  const { meeting, userTimezone, participants } = useMeetingStore();

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const displayDates = useMemo(
    () => generateDate(meeting.dates, userTimezone),
    [meeting.dates, userTimezone]
  );

  const getAvailabilityData = (slotId: string) => {
    let count = 0;
    const availableParticipants: string[] = [];
    const tzSlotId = convertTZ({ time: slotId, userTimezone });
    participants.forEach((participant) => {
      if (participant.availableSlots?.includes(tzSlotId)) {
        count++;
        availableParticipants.push(participant.name);
      }
    });

    const percentage =
      participants?.length > 0
        ? Math.round((count / participants?.length) * 100)
        : 0;

    return {
      count,
      percentage,
      availableParticipants,
    };
  };

  // Generate color based on availability percentage
  const getHeatColor = (percentage: number) => {
    if (percentage === 0) return "bg-white";
    if (percentage <= 25) return "bg-blue-100";
    if (percentage <= 50) return "bg-blue-300";
    if (percentage <= 75) return "bg-blue-500";
    return "bg-blue-700";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {/* Empty corner cell */}
            <th className="border p-2 bg-gray-100"></th>

            {/* Date headers with spacing for non-consecutive dates */}
            {displayDates.map((date, index) => {
              const needsSpacing =
                index > 0 &&
                differenceInDays(date, displayDates[index - 1]) > 1;

              return (
                <th
                  key={date}
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

              {/* Heatmap cells for each date and time */}
              {displayDates.map((date, index) => {
                const slotId = `${date}T${hour}:${minute}:00.000Z`;

                const availabilityData = getAvailabilityData(slotId);
                const heatColor = getHeatColor(availabilityData.percentage);
                // Add spacing class if current date is not consecutive with previous
                const needsSpacing =
                  index > 0 &&
                  differenceInDays(date, displayDates[index - 1]) > 1;

                const isDisabled = disabledTimeSlot(
                  meeting.dates,
                  slotId,
                  userTimezone
                );

                return (
                  <td
                    key={`${date}-${hour}-${minute}`}
                    className={`border p-0 ${
                      needsSpacing ? "border-l-4 border-l-gray-300" : ""
                    }`}
                    title={
                      availabilityData.count > 0
                        ? `${availabilityData.count} ${
                            availabilityData.count === 1 ? "person" : "people"
                          } (${
                            availabilityData.percentage
                          }%): ${availabilityData.availableParticipants.join(
                            ", "
                          )}`
                        : "No availability"
                    }
                  >
                    <div
                      className={`w-full h-8 ${heatColor} relative group ${
                        isDisabled
                          ? "bg-gray-200 cursor-not-allowed"
                          : "cursor-default"
                      }`}
                    >
                      {availabilityData.count > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {availabilityData.count}
                        </div>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 absolute z-10 -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {availabilityData.count > 0
                          ? `${availabilityData.count} / ${participants.length} (${availabilityData.percentage}%)`
                          : "No availability"}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end">
        <div className="text-sm text-gray-500 mr-2">Availability:</div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border mr-1"></div>
          <span className="text-xs mr-3">0%</span>

          <div className="w-4 h-4 bg-blue-100 mr-1"></div>
          <span className="text-xs mr-3">1-25%</span>

          <div className="w-4 h-4 bg-blue-300 mr-1"></div>
          <span className="text-xs mr-3">26-50%</span>

          <div className="w-4 h-4 bg-blue-500 mr-1"></div>
          <span className="text-xs mr-3">51-75%</span>

          <div className="w-4 h-4 bg-blue-700 mr-1"></div>
          <span className="text-xs">76-100%</span>
        </div>
      </div>
    </div>
  );
}
