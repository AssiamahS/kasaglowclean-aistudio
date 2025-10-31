import prisma from '../config/database.js';
import { isPastDate, timeRangesOverlap, addMinutes } from '../utils/helpers.js';

/**
 * Validate if a booking can be made
 */
export const validateBooking = async (serviceId, startTime, endTime) => {
  // Check if date is in the past
  if (isPastDate(startTime)) {
    return {
      isValid: false,
      error: 'Cannot book in the past'
    };
  }

  // Check if date is blocked
  const bookingDate = new Date(startTime);
  bookingDate.setHours(0, 0, 0, 0);

  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      date: {
        gte: bookingDate,
        lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (blockedDate) {
    return {
      isValid: false,
      error: `This date is not available: ${blockedDate.reason || 'Closed'}`
    };
  }

  // Check business hours
  const dayOfWeek = startTime.getDay();
  const startTimeStr = startTime.toTimeString().slice(0, 5);
  const endTimeStr = endTime.toTimeString().slice(0, 5);

  const timeSlot = await prisma.timeSlot.findFirst({
    where: {
      dayOfWeek,
      isAvailable: true,
      startTime: { lte: startTimeStr },
      endTime: { gte: endTimeStr }
    }
  });

  if (!timeSlot) {
    return {
      isValid: false,
      error: 'Selected time is outside business hours'
    };
  }

  // Check for overlapping bookings (with buffer time)
  const bufferMinutes = parseInt(process.env.BUFFER_TIME_MINUTES || '30');

  const overlappingBookings = await prisma.booking.findMany({
    where: {
      serviceId,
      status: { not: 'cancelled' },
      OR: [
        {
          startTime: {
            lt: addMinutes(endTime, bufferMinutes),
            gte: addMinutes(startTime, -bufferMinutes)
          }
        },
        {
          endTime: {
            gt: addMinutes(startTime, -bufferMinutes),
            lte: addMinutes(endTime, bufferMinutes)
          }
        }
      ]
    }
  });

  if (overlappingBookings.length > 0) {
    return {
      isValid: false,
      error: 'This time slot is already booked'
    };
  }

  return {
    isValid: true
  };
};
