import { getParticipants } from "@/lib/meetingService";

export async function getOverlappingSlots(
  meetingId: string,
  userTimezone: string
): Promise<
  {
    slotId: string;
    count: number;
    participants: string[];
    percentage: number;
  }[]
> {
  try {
    const participants = await getParticipants(meetingId, userTimezone);

    if (participants.length === 0) {
      return [];
    }

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
    const results = Object.entries(slotCounts).map(([slotId, data]) => ({
      slotId,
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
