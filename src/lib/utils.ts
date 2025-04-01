import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Meeting } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
