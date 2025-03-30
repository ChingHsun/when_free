import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { format, addDays } from "date-fns";
import { TZDate } from "@date-fns/tz";

import { Calendar } from "@/components/ui/calendar";
import { useMeetingStore } from "@/store/meetingStore";

const DATE_FORMAT = "yyyy-MM-dd";

export function DatePicker() {
  const { userTimezone, selectedDates, toggleDate } = useMeetingStore();

  // References for drag state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<Date | null>(null);
  const dragEndRef = useRef<Date | null>(null);
  const tempSelectedDatesRef = useRef<Set<string>>(new Set(selectedDates));
  const initialSelectionRef = useRef<Set<string>>(new Set(selectedDates));
  const dragOperationIsAdd = useRef<boolean>(false); // Whether we're adding or removing dates

  // This is for render updates only
  const [, setRenderTrigger] = useState(0);

  const todayInTimezone = useMemo(
    () => format(new TZDate(new Date(), userTimezone), DATE_FORMAT),
    [userTimezone]
  );

  // Reset our temporary selection when the store selection changes
  // (but only when we're not dragging)
  useEffect(() => {
    if (!isDraggingRef.current) {
      tempSelectedDatesRef.current = new Set(selectedDates);
      initialSelectionRef.current = new Set(selectedDates);
    }
  }, [selectedDates]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      const dateStr = format(date, DATE_FORMAT);
      return dateStr < todayInTimezone;
    },
    [todayInTimezone]
  );

  const isDateSelected = useCallback(
    (date: Date) => {
      const dateStr = format(date, DATE_FORMAT);
      return tempSelectedDatesRef.current.has(dateStr);
    },
    [] // Only depend on the render trigger
  );

  // Get all dates between drag start and end (works in both directions)
  const getDatesInRange = useCallback(
    (start: Date, end: Date) => {
      const result: string[] = [];

      // Don't reorder start and end - we want to preserve dragging direction
      // Instead handle both directions in the loop

      // Create copies to avoid modifying the original dates
      const startDate = new Date(start);
      const endDate = new Date(end);

      // Determine direction of iteration
      const direction = startDate <= endDate ? 1 : -1;

      // Include the start and end dates and all dates in between
      let currentDate = new Date(startDate);

      // Loop condition handles both directions
      while (
        (direction > 0 && currentDate <= endDate) ||
        (direction < 0 && currentDate >= endDate)
      ) {
        const dateStr = format(currentDate, DATE_FORMAT);
        if (!isDateDisabled(currentDate)) {
          result.push(dateStr);
        }

        // Add or subtract days based on direction
        currentDate = addDays(currentDate, direction);
      }

      return result;
    },
    [isDateDisabled]
  );

  // Handle mouse down to start drag
  const handleMouseDown = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;

      // Store the initial selection to toggle properly
      initialSelectionRef.current = new Set(selectedDates);

      // Start dragging
      isDraggingRef.current = true;
      dragStartRef.current = date;
      dragEndRef.current = date;

      // Initialize with just this date
      const dateStr = format(date, DATE_FORMAT);

      // Toggle this date (if it was selected, remove it; if not, add it)
      const wasSelected = initialSelectionRef.current.has(dateStr);
      tempSelectedDatesRef.current = new Set(initialSelectionRef.current);

      if (wasSelected) {
        tempSelectedDatesRef.current.delete(dateStr);
      } else {
        tempSelectedDatesRef.current.add(dateStr);
      }

      // Store whether we're adding or removing dates
      dragOperationIsAdd.current = !wasSelected;

      // Force a render update
      setRenderTrigger((prev) => prev + 1);
    },
    [isDateDisabled, selectedDates]
  );

  // Handle mouse enter during drag
  const handleMouseEnter = useCallback(
    (date: Date) => {
      if (!isDraggingRef.current || isDateDisabled(date)) return;

      dragEndRef.current = date;

      // Get all dates in the range
      const dateRange = getDatesInRange(dragStartRef.current!, date);

      // Reset to initial selection
      tempSelectedDatesRef.current = new Set(initialSelectionRef.current);

      // Apply the operation consistently based on the initial action
      // If dragOperationIsAdd is true, we add all dates in range
      // If false, we remove all dates in range
      dateRange.forEach((dateStr) => {
        if (dragOperationIsAdd.current) {
          tempSelectedDatesRef.current.add(dateStr);
        } else {
          tempSelectedDatesRef.current.delete(dateStr);
        }
      });

      // Force a render update
      setRenderTrigger((prev) => prev + 1);
    },
    [getDatesInRange, isDateDisabled]
  );

  // Handle end of drag selection
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    // End drag
    isDraggingRef.current = false;

    // Commit the changes to the store
    const newDatesSet = new Set(tempSelectedDatesRef.current);
    const oldDatesSet = new Set(selectedDates);

    // Remove dates that were selected but should be removed
    selectedDates.forEach((date) => {
      if (!newDatesSet.has(date)) {
        toggleDate({ date, isSelect: true });
      }
    });

    // Add dates that were not selected but should be added
    newDatesSet.forEach((date) => {
      if (!oldDatesSet.has(date)) {
        toggleDate({ date, isSelect: false });
      }
    });

    // Reset drag references
    dragStartRef.current = null;
    dragEndRef.current = null;
  }, [selectedDates, toggleDate]);

  // Set up global mouse up handler
  useEffect(() => {
    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [handleDragEnd]);

  // Custom day renderer with drag handling
  const renderDay = useCallback(
    (date: Date, day: string) => {
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);

      return (
        <div
          className={`
            w-8 h-8 m-0.5 flex items-center justify-center select-none
            ${selected ? "bg-primary text-primary-foreground rounded-md" : ""}
            ${
              disabled
                ? "text-gray-300 cursor-not-allowed disabled"
                : "cursor-pointer"
            }
          `}
          onMouseDown={() => !disabled && handleMouseDown(date)}
          onMouseEnter={() => !disabled && handleMouseEnter(date)}
        >
          {day}
        </div>
      );
    },
    [handleMouseDown, handleMouseEnter, isDateDisabled, isDateSelected]
  );

  return (
    <div className="space-y-6">
      <Calendar
        mode="multiple"
        onSelect={() => {}} // We handle selection ourselves
        className="rounded-md border w-fit"
        components={{
          Day: ({ date }) => renderDay(date, format(date, "d")),
        }}
      />
    </div>
  );
}
