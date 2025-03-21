import { create } from "zustand";
import { Meeting, Participant } from "@/lib/types";
import {
  addParticipantService,
  createMeetingService,
  getMeetingByIdService,
  updateAvailabilityService,
} from "@/lib/meetingService";

interface MeetingState {
  meeting: Meeting;
  participants: Participant[] | null;
  currentUser: Participant | null;
  selectedSlots: string[];

  setMeeting: (value: Partial<Meeting>) => void;
  createMeeting: (
    data: Pick<Meeting, "title" | "description" | "dates"> & {
      name: string;
    }
  ) => Promise<string>;
  fetchMeeting: (data: { meetingId: string }) => Promise<void>;
  signupMeeting: (data: { meetingId: string; name: string }) => Promise<void>;
  updateAvailability: (data: {
    meetingId: string;
    name: string;
    availableSlots: string[];
  }) => Promise<void>;
  toggleSlot: (data: { slotId: string; isSelect: boolean }) => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meeting: { id: null, title: null, description: null, dates: null },
  participants: null,
  currentUser: null,
  selectedSlots: [],

  setMeeting: (updatedMeeting) =>
    set((state) => ({
      meeting: { ...state.meeting, ...updatedMeeting },
    })),

  createMeeting: async ({
    title,
    description,
    dates,
    name,
  }): Promise<string> => {
    const { meetingId, participantId } = await createMeetingService({
      title,
      description,
      dates,
      name,
    });
    set({
      meeting: {
        id: meetingId,
        title,
        description,
        dates,
      },
      participants: [{ id: participantId, name: name }],
      currentUser: { id: participantId, name },
    });
    return meetingId;
  },

  fetchMeeting: async ({ meetingId }) => {
    try {
      const { meeting, participants } = await getMeetingByIdService({
        meetingId,
      });
      set({ meeting, participants });
    } catch (err) {
      throw err;
    }
  },

  signupMeeting: async ({ meetingId, name }) => {
    try {
      const { participants } = get();
      let currentUser = participants?.find(
        (participant) => participant.name === name
      );
      if (!currentUser) {
        const { participantId } = await addParticipantService({
          meetingId,
          name,
        });

        currentUser = {
          id: participantId,
          name: name,
        };
      }

      set((state) => ({
        ...state,
        currentUser,
        participants: state.participants
          ? [...state.participants, currentUser]
          : [currentUser],
        selectedSlots: currentUser.availableSlots,
      }));
    } catch (err) {
      throw err;
    }
  },

  updateAvailability: async ({ meetingId, name, availableSlots }) => {
    try {
      await updateAvailabilityService({ meetingId, name, availableSlots });
      set((state) => ({
        participants:
          state.participants?.map((p) =>
            p.name === name ? { ...p, availableSlots: availableSlots } : p
          ) || [],
      }));
    } catch (err) {
      throw err;
    }
  },

  toggleSlot: ({ slotId, isSelect }) => {
    let updateSlots;
    const { selectedSlots } = get();

    if (isSelect) {
      updateSlots = selectedSlots.filter((id) => id !== slotId);
    } else {
      updateSlots = [...selectedSlots, slotId];
    }

    set({ selectedSlots: updateSlots });
  },
}));
