// src/lib/meetingService.ts
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { firestore } from "./firebase";

// 創建會議
export async function createMeeting(
  title: string,
  description: string,
  dates: string[]
) {
  try {
    // 準備會議資料
    const meeting = {
      title,
      description,
      dates, // 日期數組 (YYYY-MM-DD 格式)
      createdAt: serverTimestamp(),
    };

    // 添加到 Firestore
    const docRef = await addDoc(collection(firestore, "meetings"), meeting);

    return {
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
}

// 通過 ID 獲取會議
export async function getMeetingById(id: string) {
  try {
    const docRef = doc(firestore, "meetings", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt || Date.now()),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting meeting:", error);
    throw error;
  }
}

// 添加參與者
export async function addParticipant(
  meetingId: string,
  name: string,
  timezone: string,
  availableSlots: string[]
) {
  try {
    // 檢查參與者是否已存在
    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      name
    );
    const participantSnapshot = await getDoc(participantRef);

    if (participantSnapshot.exists()) {
      // 如果參與者已存在，更新其可用時間
      await updateDoc(participantRef, {
        availableSlots,
        timezone,
        lastUpdated: serverTimestamp(),
      });
    } else {
      // 創建新參與者
      await setDoc(participantRef, {
        name,
        timezone,
        availableSlots,
        joinedAt: serverTimestamp(),
      });
    }

    return name;
  } catch (error) {
    console.error("Error adding/updating participant:", error);
    throw error;
  }
}

// 更新參與者可用時間
export async function updateParticipantAvailability(
  meetingId: string,
  participantName: string,
  availableSlots: string[]
) {
  try {
    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      participantName
    );

    await updateDoc(participantRef, {
      availableSlots,
      lastUpdated: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating participant availability:", error);
    throw error;
  }
}

// 獲取所有參與者
export async function getParticipants(meetingId: string) {
  try {
    const participantsRef = collection(
      firestore,
      `meetings/${meetingId}/participants`
    );
    const querySnapshot = await getDocs(participantsRef);

    const participants = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        name: doc.id,
        ...data,
        joinedAt:
          data.joinedAt instanceof Timestamp
            ? data.joinedAt.toDate()
            : new Date(data.joinedAt || Date.now()),
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
export async function deleteParticipant(
  meetingId: string,
  participantName: string
) {
  try {
    const participantRef = doc(
      firestore,
      `meetings/${meetingId}/participants`,
      participantName
    );
    await participantRef.delete();
    return true;
  } catch (error) {
    console.error("Error deleting participant:", error);
    throw error;
  }
}
