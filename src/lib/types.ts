export interface Meeting {
  id: string;
  title: string;
  description: string;
  dates: string[];
  resultTimeSlots: string[];
  participants: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  availableSlots?: string[];
}
