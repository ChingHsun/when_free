export interface Meeting {
  id: string | null;
  title: string | null;
  description: string | null;
  dates: DateRange[] | null;
  resultTimeSlots?: string[] | null;
  participants?: Participant[] | null;
}

export type DateRange = {
	startTime: Date;
	endTime: Date;
}

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
