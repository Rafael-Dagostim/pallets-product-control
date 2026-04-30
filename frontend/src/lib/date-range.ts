import { startOfDay, endOfDay } from "date-fns";

export function toUTCDayRange(date: Date): { from: string; to: string } {
  return {
    from: startOfDay(date).toISOString(),
    to: endOfDay(date).toISOString(),
  };
}

export function toUTCRange(from: Date, to: Date): { from: string; to: string } {
  return {
    from: startOfDay(from).toISOString(),
    to: endOfDay(to).toISOString(),
  };
}
