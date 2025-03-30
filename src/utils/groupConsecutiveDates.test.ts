import { describe, test, expect } from "vitest";
import { groupConsecutiveDates } from "./groupConsecutiveDates";
describe("groupConsecutiveDates", () => {
  test("groups consecutive dates correctly", () => {
    const testDates = [
      "2023-05-03",
      "2023-05-01",
      "2023-05-02",
      "2023-05-05",
      "2023-05-09",
    ];

    const expected = [
      { startDate: "2023-05-01T00:00:00", endDate: "2023-05-03T23:59:59.999" },
      { startDate: "2023-05-05T00:00:00", endDate: "2023-05-05T23:59:59.999" },
      { startDate: "2023-05-09T00:00:00", endDate: "2023-05-09T23:59:59.999" },
    ];

    expect(groupConsecutiveDates(testDates)).toEqual(expected);
  });

  test("groups consecutive dates correctly if duplicated", () => {
    const testDates = [
      "2023-05-03",
      "2023-05-01",
      "2023-05-02",
      "2023-05-02",
      "2023-05-05",
      "2023-05-09",
      "2023-05-09",
    ];

    const expected = [
      {
        startDate: "2023-05-01T00:00:00",
        endDate: "2023-05-03T23:59:59.999",
      },
      {
        startDate: "2023-05-05T00:00:00",
        endDate: "2023-05-05T23:59:59.999",
      },
      {
        startDate: "2023-05-09T00:00:00",
        endDate: "2023-05-09T23:59:59.999",
      },
    ];

    expect(groupConsecutiveDates(testDates)).toEqual(expected);
  });
});
