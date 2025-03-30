import { create } from "zustand";
import { Meeting, Participant } from "@/lib/types";
import {
  addParticipantService,
  createMeetingService,
  getMeetingByIdService,
  updateAvailabilityService,
} from "@/lib/meetingService";
import { zonedTimeToUtc } from "date-fns-tz";
import { groupConsecutiveDates } from "@/utils/groupConsecutiveDates";

interface MeetingState {
  meeting: Meeting;
  selectedDates: string[];
  participants: Participant[] | null;
  currentUser: Participant | null;
  selectedSlots: string[];
  userTimezone: string;

  setMeeting: (value: Partial<Meeting>) => void;
  setUserTimezone: (timezone: string) => void;
  createMeeting: (
    data: Pick<Meeting, "title" | "description"> & {
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
  toggleDate: (data: { date: string; isSelect: boolean }) => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meeting: { id: "", title: "", description: null, dates: [] },
  selectedDates: [],
  participants: null,
  currentUser: null,
  selectedSlots: [],
  userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

  setMeeting: (updatedMeeting) =>
    set((state) => ({
      meeting: { ...state.meeting, ...updatedMeeting },
    })),

  setUserTimezone: (timezone) => set({ userTimezone: timezone }),

  createMeeting: async ({ title, description, name }): Promise<string> => {
    const { selectedDates, userTimezone } = get();

    const sortedDates = groupConsecutiveDates(selectedDates).map(
      ({ startDate, endDate }) => {
        return {
          startTime: zonedTimeToUtc(startDate, userTimezone),
          endTime: zonedTimeToUtc(endDate, userTimezone),
        };
      }
    );

    const { meetingId, participantId } = await createMeetingService({
      title,
      description,
      dates: sortedDates,
      name,
    });

    set({
      meeting: {
        id: meetingId,
        title,
        description,
        dates: sortedDates,
      },
      participants: [{ id: participantId, name: name }],
      currentUser: { id: participantId, name },
      selectedDates: [],
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

  toggleDate: ({ date, isSelect }) => {
    let updateSlots;
    const { selectedDates } = get();

    if (isSelect) {
      updateSlots = selectedDates.filter((id) => id !== date);
    } else {
      updateSlots = [...selectedDates, date];
    }

    set({ selectedDates: updateSlots });
  },
}));
