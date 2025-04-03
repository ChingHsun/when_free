import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { Meeting, Participant } from "./types";
import { TZDate } from "@date-fns/tz";

export async function createMeetingService({
  title,
  description,
  dates,
  name,
}: Pick<Meeting, "title" | "description" | "dates"> & {
  name: string;
}) {
  try {
    const meeting = {
      title,
      description,
      dates: dates.map(({ startTime, endTime }) => ({
        startTime: new TZDate(startTime, "UTC").toISOString(),
        endTime: new TZDate(endTime, "UTC").toISOString(),
      })),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(firestore, "meetings"), meeting);
    const meetingId = docRef.id;

    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      name
    );
    await setDoc(participantRef, {
      name,
      availableSlots: [],
      joinedAt: serverTimestamp(),
    });

    const participantId = participantRef.id;

    return { meetingId, participantId };
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
}

export async function getMeetingByIdService({
  meetingId,
  userTimezone,
}: {
  meetingId: string;
  userTimezone: string;
}): Promise<{
  meeting: Meeting;
  participants: Participant[];
}> {
  try {
    const meetingRef = doc(firestore, "meetings", meetingId);
    const meetingSnap = await getDoc(meetingRef);

    if (!meetingSnap.exists()) {
      throw new Error("Meeting not found");
    }

    const participantsRef = collection(
      firestore,
      `meetings/${meetingId}/participants`
    );
    const participantsSnap = await getDocs(participantsRef);

    const participants: Participant[] = participantsSnap.docs.map((doc) => {
      const data = doc.data() as Omit<Participant, "id">;
      return {
        id: doc.id,
        ...data,
        availableSlots: data.availableSlots?.map((time) =>
          new TZDate(time, userTimezone).toISOString()
        ),
      };
    });

    const meetingData = meetingSnap.data() as Omit<Meeting, "id">;

    const meeting = {
      id: meetingSnap.id,
      ...meetingData,
      date: meetingData.dates.map(({ startTime, endTime }) => ({
        startTime: new TZDate(startTime, userTimezone).toISOString(),
        endTime: new TZDate(endTime, userTimezone).toISOString(),
      })),
    };

    return { meeting, participants };
  } catch (error) {
    console.error("Error getting meeting:", error);
    throw error;
  }
}

export async function addParticipantService({
  meetingId,
  name,
}: {
  meetingId: string;
  name: string;
}) {
  try {
    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      name
    );

    await setDoc(participantRef, {
      name,
      availableSlots: [],
      joinedAt: serverTimestamp(),
    });

    const participantId = participantRef.id;
    return { participantId };
  } catch (error) {
    console.error("Error adding/updating participant:", error);
    throw error;
  }
}

export async function updateAvailabilityService({
  meetingId,
  name,
  availableSlots,
}: {
  meetingId: string;
  name: string;
  availableSlots: string[];
  userTimezone: string;
}) {
  try {
    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      name
    );

    await updateDoc(participantRef, {
      availableSlots: availableSlots.map((time) =>
        new TZDate(time, "UTC").toISOString()
      ),
      lastUpdated: serverTimestamp(),
    });

    return;
  } catch (error) {
    console.error("Error updating participant availability:", error);
    throw error;
  }
}

export async function getParticipants(meetingId: string, userTimezone: string) {
  try {
    const participantsRef = collection(
      firestore,
      `meetings/${meetingId}/participants`
    );
    const querySnapshot = await getDocs(participantsRef);

    const participants = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Participant, "id">;
      return {
        id: doc.id,
        ...data,
        availableSlots: data.availableSlots?.map((time) =>
          new TZDate(time, userTimezone).toISOString()
        ),
      };
    });

    return participants;
  } catch (error) {
    console.error("Error getting participants:", error);
    throw error;
  }
}


