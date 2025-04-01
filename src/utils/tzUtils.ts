import { TZDate } from "@date-fns/tz";

function getTzOffset(timeZone: string): string {
  const now = new Date();
  const tzDate = new TZDate(now, timeZone);

  const dateString = tzDate.toString();
  const offsetMatch = dateString.match(/GMT([+-]\d{4})/);

  const offset = offsetMatch![1];
  return `${offset.slice(0, 3)}:${offset.slice(3, 5)}`;
}

function convertTZ({
  time,
  userTimezone,
}: {
  time: string;
  userTimezone: string;
}) {
  return `${time.replace(/Z$/, getTzOffset(userTimezone))}`;
}

function convertUTC({
  time,
  userTimezone,
}: {
  time: string;
  userTimezone: string;
}) {
  const tzDate = new TZDate(time, userTimezone).toISOString();
  return tzDate.replace(/[+-]\d{2}:\d{2}$/, "Z");
}

export { getTzOffset, convertUTC, convertTZ };
