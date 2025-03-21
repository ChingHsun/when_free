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
      dates,
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
}: {
  meetingId: string;
}): Promise<{ meeting: Meeting; participants: Participant[] }> {
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
      };
    });

    const meetingData = meetingSnap.data() as Omit<Meeting, "id">;

    const meeting = {
      id: meetingSnap.id,
      ...meetingData,
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
}) {
  try {
    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      name
    );

    await updateDoc(participantRef, {
      availableSlots,
      lastUpdated: serverTimestamp(),
    });

    return;
  } catch (error) {
    console.error("Error updating participant availability:", error);
    throw error;
  }
}

export async function getParticipants(meetingId: string) {
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
      };
    });

    return participants;
  } catch (error) {
    console.error("Error getting participants:", error);
    throw error;
  }
}

// 計算重疊的時間槽
export async function getOverlappingSlots(meetingId: string) {
  try {
    // 獲取所有參與者
    const participants = await getParticipants(meetingId);

    if (participants.length === 0) {
      return [];
    }

    // 計算每個時間槽有多少人可用
    const slotCounts: Record<
      string,
      { count: number; participants: string[] }
    > = {};

    participants.forEach((participant) => {
      (participant.availableSlots || []).forEach((slot) => {
        if (!slotCounts[slot]) {
          slotCounts[slot] = { count: 0, participants: [] };
        }
        slotCounts[slot].count += 1;
        slotCounts[slot].participants.push(participant.name);
      });
    });

    // 將結果轉換為數組並計算百分比
    const results = Object.entries(slotCounts).map(([slot, data]) => ({
      slot,
      count: data.count,
      participants: data.participants,
      percentage: Math.round((data.count / participants.length) * 100),
    }));

    // 按照人數和百分比排序（從高到低）
    return results.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.percentage - a.percentage;
    });
  } catch (error) {
    console.error("Error calculating overlapping slots:", error);
    throw error;
  }
}

// 刪除參與者
export async function deleteParticipant(meetingId: string, name: string) {
  try {
    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      name
    );
    await participantRef.delete();
    return true;
  } catch (error) {
    console.error("Error deleting participant:", error);
    throw error;
  }
}
