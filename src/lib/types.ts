export interface Meeting {
  id: string | null;
  title: string | null;
  description: string | null;
  dates: string[] | null;
  resultTimeSlots?: string[] | null;
  participants?: Participant[] | null;
}

export interface Participant {
  id: string;
  name: string;
  availableSlots?: string[];
}
