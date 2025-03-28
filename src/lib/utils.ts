import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { Meeting } from "./types";

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

  return { timeSlots, formatTime };
};

export async function findExistParticipant({
  meeting,
  name,
}: {
  meeting: Meeting;
  name: string;
}) {
  try {
    const allParticipants = meeting.participants;

    const existingParticipant = allParticipants?.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    return existingParticipant || null;
  } catch (error) {
    console.error("Error checking if participant exists:", error);
    return null;
  }
}
