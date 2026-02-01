import { format, addMinutes, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export function formatDate(date: Date, pattern: string = 'dd/MM/yyyy'): string {
  return format(date, pattern);
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDateTime(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function isTimeSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  existingAppointments: { startTime: Date; endTime: Date }[]
): boolean {
  return !existingAppointments.some((appointment) =>
    isWithinInterval(slotStart, {
      start: appointment.startTime,
      end: appointment.endTime,
    }) ||
    isWithinInterval(slotEnd, {
      start: appointment.startTime,
      end: appointment.endTime,
    })
  );
}

export function convertToTimezone(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone);
}

export function convertFromTimezone(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone);
}

export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}
