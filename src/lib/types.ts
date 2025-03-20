export interface Meeting {
  id: string;
  title: string;
  description: string;
  selectedDates: string[];
  resultTimeSlots: string[];
  participants: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  availableSlots?: string[];
}
