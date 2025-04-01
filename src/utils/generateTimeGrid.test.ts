import { DateRange } from "@/lib/types";
import { expect, test, describe } from "vitest";
import { disabledTimeSlot } from "./generateTimeGrid";

export const testCases: {
  singleDate: DateRange[];
  singleDateLate: DateRange[];
  multipleDates: DateRange[];
  nonConsecutiveDates: DateRange[];
  combineDates: DateRange[];
} = {
  singleDate: [
    {
      startTime: new Date("2025-03-29T00:00:00.000Z"),
      endTime: new Date("2025-03-29T23:59:59.999Z"),
    },
  ],
  singleDateLate: [
    {
      startTime: new Date("2025-03-29T16:00:00.000Z"),
      endTime: new Date("2025-03-30T15:59:59.999Z"),
    },
  ],
  multipleDates: [
    {
      startTime: new Date("2025-03-29T16:00:00.000Z"),
      endTime: new Date("2025-04-01T15:59:59.999Z"),
    },
  ],
  nonConsecutiveDates: [
    {
      startTime: new Date("2025-03-29T16:00:00.000Z"),
      endTime: new Date("2025-03-30T15:59:59.999Z"),
    },
    {
      startTime: new Date("2025-04-05T17:00:00.000Z"),
      endTime: new Date("2025-04-06T18:59:59.999Z"),
    },
  ],
  combineDates: [
    {
      startTime: new Date("2025-03-29T16:00:00.000Z"),
      endTime: new Date("2025-04-01T15:59:59.999Z"),
    },
    {
      startTime: new Date("2025-04-05T17:00:00.000Z"),
      endTime: new Date("2025-04-06T18:59:59.999Z"),
    },
  ],
};

describe("test", () => {
  test("singleDate", () => {
    expect(
      disabledTimeSlot(
        testCases.singleDateLate,
        "2025-03-29T00:00:00.000Z",
        "Asia/Taipei"
      )
    ).toBe(false);
    // expect(
    //   disabledTimeSlot(testCases.singleDate, "2025-03-29T00:00:00.000z")
    // ).toBe(false);
    // expect(
    //   disabledTimeSlot(testCases.singleDate, "2025-03-29T23:30:00.000z")
    // ).toBe(false);
    // expect(generateDate(testCases.singleDate)).toMatchObject(["03-29"]);
  });

  //   test("singleDateLate", () => {
  //     expect(
  //       disabledTimeSlot(testCases.singleDateLate, "2025-03-29T00:00:00.000z")
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(testCases.singleDateLate, "2025-03-29T16:00:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.singleDateLate, "2025-03-30T00:00:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.singleDateLate, "2025-03-30T15:30:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.singleDateLate, "2025-03-30T23:00:00.000z")
  //     ).toBe(true);
  //     expect(generateDate(testCases.singleDateLate)).toMatchObject([
  //       "03-29",
  //       "03-30",
  //     ]);
  //   });

  //   test("multipleDates", () => {
  //     expect(
  //       disabledTimeSlot(testCases.multipleDates, "2025-03-29T03:00:00.000z")
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(testCases.multipleDates, "2025-03-29T16:00:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.multipleDates, "2025-03-30T16:30:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.multipleDates, "2025-04-01T15:30:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.multipleDates, "2025-04-01T16:00:00.000z")
  //     ).toBe(true);
  //     expect(generateDate(testCases.multipleDates)).toMatchObject([
  //       "03-29",
  //       "03-30",
  //       "03-31",
  //       "04-01",
  //     ]);
  //   });

  //   test("nonConsecutiveDates", () => {
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-03-29T14:00:00.000z"
  //       )
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-03-29T16:00:00.000z"
  //       )
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-03-30T15:00:00.000z"
  //       )
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-03-30T16:00:00.000z"
  //       )
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-04-05T12:30:00.000z"
  //       )
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-04-05T19:30:00.000z"
  //       )
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-04-06T18:30:00.000z"
  //       )
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(
  //         testCases.nonConsecutiveDates,
  //         "2025-04-06T19:30:00.000z"
  //       )
  //     ).toBe(true);
  //     expect(generateDate(testCases.nonConsecutiveDates)).toMatchObject([
  //       "03-29",
  //       "03-30",
  //       "04-05",
  //       "04-06",
  //     ]);
  //   });

  //   test("combineDates", () => {
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-03-29T03:00:00.000z")
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-03-29T16:00:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-03-30T16:30:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-04-01T15:30:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-04-01T16:00:00.000z")
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-04-05T12:30:00.000z")
  //     ).toBe(true);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-04-05T19:30:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-04-06T18:30:00.000z")
  //     ).toBe(false);
  //     expect(
  //       disabledTimeSlot(testCases.combineDates, "2025-04-06T19:30:00.000z")
  //     ).toBe(true);
  //     expect(generateDate(testCases.combineDates)).toMatchObject([
  //       "03-29",
  //       "03-30",
  //       "03-31",
  //       "04-01",
  //       "04-05",
  //       "04-06",
  //     ]);
  //   });
});
