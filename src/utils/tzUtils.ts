import { TZDate } from "@date-fns/tz";

function getTzOffset(timeZone: string) {
  try {
    const now = new Date();
    const tzDate = new TZDate(now, timeZone);

    const dateString = tzDate.toString();
    const offsetMatch = dateString.match(/GMT([+-]\d{4})/);

    if (offsetMatch && offsetMatch[1]) {
      const offset = offsetMatch[1];
      return `${offset.slice(0, 3)}:${offset.slice(3, 5)}`;
    }
  } catch (error) {
    console.error(`Error calculating offset for ${timeZone}:`, error);
  }
}

function covertTZ({
  time,
  userTimezone,
}: {
  time: string;
  userTimezone: string;
}) {
  console.log("t", `${time}${getTzOffset(userTimezone)}`);
  return `${time}${getTzOffset(userTimezone)}`;
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

export { getTzOffset, convertUTC, covertTZ };
