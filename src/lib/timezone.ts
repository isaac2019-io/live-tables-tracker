import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { endOfDay, startOfDay, subDays } from "date-fns";

import { TIMEZONE } from "@/lib/constants";

export function formatUtc8(date: Date, pattern = "yyyy-MM-dd HH:mm") {
  return formatInTimeZone(date, TIMEZONE, pattern);
}

export function toUtc8DateString(date: Date) {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd");
}

export function parseUtc8DateTime(value: string): Date {
  return fromZonedTime(value, TIMEZONE);
}

export function utc8DayBounds(dateString: string) {
  const localStart = fromZonedTime(`${dateString}T00:00:00`, TIMEZONE);
  const localEnd = fromZonedTime(`${dateString}T23:59:59.999`, TIMEZONE);
  return { start: localStart, end: localEnd };
}

export function todayUtc8String() {
  return toUtc8DateString(new Date());
}

export function recentUtc8Dates(count: number) {
  const today = toZonedTime(new Date(), TIMEZONE);
  return Array.from({ length: count }, (_, index) =>
    formatInTimeZone(subDays(startOfDay(today), index), TIMEZONE, "yyyy-MM-dd"),
  );
}

export function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function utc8DayRangeLabel(dateString: string) {
  const { start, end } = utc8DayBounds(dateString);
  return `${formatUtc8(start)} ~ ${formatUtc8(end)} (UTC+8)`;
}

export function formatUtc8ForInput(date: Date) {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm");
}
