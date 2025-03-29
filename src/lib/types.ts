export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  dates: DateRange[];
  resultTimeSlots?: string[] | null;
  participants?: Participant[] | null;
}

export type DateRange = {
  startTime: Date;
  endTime: Date;
};

export interface Participant {
  id: string;
  name: string;
  availableSlots?: string[];
}

export interface AvailabilityResult {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: string[];
  count: number;
  totalParticipants: number;
  percentage: number;
}
