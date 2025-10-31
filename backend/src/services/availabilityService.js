import prisma from '../config/database.js';
import { addMinutes } from '../utils/helpers.js';

/**
 * Get available time slots for a service on a specific date
 */
export const getAvailableSlots = async (serviceId, dateStr, durationMinutes) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  // Check if date is in the past
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date < now) {
    return [];
  }

  // Check if date is blocked
  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (blockedDate) {
    return [];
  }

  // Get business hours for this day of week
  const dayOfWeek = date.getDay();
  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      dayOfWeek,
      isAvailable: true
    },
    orderBy: { startTime: 'asc' }
  });

  if (timeSlots.length === 0) {
    return [];
  }

  // Get existing bookings for this date and service
  const existingBookings = await prisma.booking.findMany({
    where: {
      serviceId,
      bookingDate: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { not: 'cancelled' }
    },
    orderBy: { startTime: 'asc' }
  });

  const availableSlots = [];
  const bufferMinutes = parseInt(process.env.BUFFER_TIME_MINUTES || '30');

  // For each time slot, generate 30-minute intervals
  for (const slot of timeSlots) {
    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const [endHour, endMinute] = slot.endTime.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    // Generate slots every 30 minutes
    while (currentTime < slotEnd) {
      const proposedEnd = addMinutes(currentTime, durationMinutes);

      // Check if this slot + duration fits within business hours
      if (proposedEnd <= slotEnd) {
        // Check if this time is available (no overlapping bookings)
        const isAvailable = !existingBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          const bufferedStart = addMinutes(bookingStart, -bufferMinutes);
          const bufferedEnd = addMinutes(bookingEnd, bufferMinutes);

          return currentTime < bufferedEnd && proposedEnd > bufferedStart;
        });

        // Only show future slots (if today, must be in the future)
        const isInFuture = date > now || currentTime > new Date();

        if (isAvailable && isInFuture) {
          availableSlots.push({
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: proposedEnd.toTimeString().slice(0, 5),
            available: true
          });
        }
      }

      // Move to next 30-minute slot
      currentTime = addMinutes(currentTime, 30);
    }
  }

  return availableSlots;
};
