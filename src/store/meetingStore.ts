import { create } from "zustand";
import { Meeting, Participant } from "@/lib/types";
import {
  addParticipantService,
  createMeetingService,
  getMeetingByIdService,
  updateAvailabilityService,
} from "@/lib/meetingService";
import { groupConsecutiveDates } from "@/utils/groupConsecutiveDates";
import { convertHardTextTZ } from "@/utils/tzUtils";
import { TZDate } from "@date-fns/tz";

interface MeetingState {
  meeting: Meeting;
  selectedDates: string[];
  participants: Participant[];
  currentUser: Participant | null;
  selectedTZSlots: string[];
  userTimezone: string;

  setMeeting: (value: Partial<Meeting>) => void;
  setSelectedTZSlots: (date: string[]) => void;
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
  toggleDate: (data: { date: string; isSelect: boolean }) => void;
  toggleSlot: (data: { slotId: string; isSelect: boolean }) => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meeting: { id: "", title: "", description: null, dates: [] },
  selectedDates: [],
  participants: [],
  currentUser: null,
  selectedTZSlots: [],
  userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

  setMeeting: (updatedMeeting) =>
    set((state) => ({
      meeting: { ...state.meeting, ...updatedMeeting },
    })),

  setUserTimezone: (timezone) => {
    const { meeting, selectedDates, selectedTZSlots, participants } = get();

    const updateMeeting = {
      ...meeting,
      dates: meeting.dates.map(({ startTime, endTime }) => ({
        startTime: new TZDate(startTime, "UTC").toISOString(),
        endTime: new TZDate(endTime, "UTC").toISOString(),
      })),
    };

    const updatedParticipants = participants.map((participant) => ({
      ...participant,
      availableSlots: participant.availableSlots?.map((slot) =>
        new TZDate(slot, timezone).toISOString()
      ),
    }));

    set({
      userTimezone: timezone,
      meeting: updateMeeting,
      selectedDates: selectedDates.map((date) =>
        new TZDate(date, timezone).toISOString()
      ),
      selectedTZSlots: selectedTZSlots.map((time) =>
        new TZDate(time, timezone).toISOString()
      ),
      participants: updatedParticipants,
    });
  },

  setSelectedTZSlots: (dates) => {
    const { userTimezone } = get();
    set({
      selectedTZSlots: dates.map((date) =>
        convertHardTextTZ({ time: date, userTimezone })
      ),
    });
  },

  toggleSlot: ({ slotId, isSelect }) => {
    let updateSlots;
    const { selectedTZSlots } = get();

    if (isSelect) {
      updateSlots = selectedTZSlots.filter((id) => id !== slotId);
    } else {
      updateSlots = [...selectedTZSlots, slotId];
    }

    set({ selectedTZSlots: updateSlots });
  },

  createMeeting: async ({ title, description, name }): Promise<string> => {
    const { selectedDates, userTimezone } = get();

    const sortedDates = groupConsecutiveDates(selectedDates, userTimezone);

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
    const { userTimezone } = get();

    try {
      const { meeting, participants } = await getMeetingByIdService({
        meetingId,
        userTimezone,
      });
      set({
        meeting,
        participants,
      });
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
          availableSlots: [],
        };
      }

      set((state) => ({
        ...state,
        currentUser,
        participants: state.participants
          ? [...state.participants, currentUser]
          : [currentUser],
        selectedTZSlots: currentUser.availableSlots,
      }));
    } catch (err) {
      throw err;
    }
  },

  updateAvailability: async ({ meetingId, name, availableSlots }) => {
    const { userTimezone } = get();

    try {
      await updateAvailabilityService({
        meetingId,
        name,
        availableSlots,
        userTimezone,
      });
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

  toggleDate: ({ date, isSelect }) => {
    let updateDates;
    const { selectedDates } = get();

    if (isSelect) {
      updateDates = selectedDates.filter((id) => id !== date);
    } else {
      updateDates = [...selectedDates, date];
    }

    set({ selectedDates: updateDates });
  },
}));
