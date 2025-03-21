import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      timeSlots.push({ hour, minute });
    }
  }

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "EEE, MMM d");
  };

  return { timeSlots, formatTime, formatDate };
};
