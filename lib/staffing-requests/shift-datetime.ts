const AGENCY_TZ = "America/Los_Angeles";

function parseTimeParts(time: string): { hours: number; minutes: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) throw new Error("Invalid time format");
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function zonedDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const { hours, minutes } = parseTimeParts(timeStr);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: AGENCY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(utcGuess);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const localAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
  );
  const offset = localAsUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offset);
}

export function combineShiftDateTimes(
  shiftDate: string,
  startTime: string,
  endTime: string,
): { startAt: Date; endAt: Date } {
  const startAt = zonedDateTime(shiftDate, startTime);
  let endAt = zonedDateTime(shiftDate, endTime);
  if (endAt <= startAt) {
    endAt = new Date(endAt.getTime() + 24 * 60 * 60 * 1000);
  }
  return { startAt, endAt };
}

export function startOfTodayAgencyTz(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: AGENCY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = formatter.format(now);
  return zonedDateTime(dateStr, "00:00");
}

function todayDateStringAgencyTz(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: AGENCY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isShiftDateInPast(shiftDate: string, _startTime?: string): boolean {
  return shiftDate < todayDateStringAgencyTz();
}

export function formatShiftWindow(startAt: Date, endAt: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: AGENCY_TZ,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const start = startAt.toLocaleString("en-US", opts);
  const end = endAt.toLocaleString("en-US", { ...opts, month: undefined, day: undefined });
  return `${start} – ${end}`;
}
