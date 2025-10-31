import express from 'express';
import prisma from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { generateConfirmationCode } from '../utils/helpers.js';
import { validateBooking } from '../services/bookingService.js';
import { sendBookingConfirmation } from '../services/emailService.js';

const router = express.Router();

// POST /api/bookings - Create new booking (public)
router.post('/', async (req, res, next) => {
  try {
    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      startTime,
      address,
      city,
      state,
      zipCode,
      apartmentUnit,
      specialNotes
    } = req.body;

    // Validate required fields
    if (!serviceId || !customerName || !customerEmail || !customerPhone ||
        !bookingDate || !startTime || !address) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service || !service.active) {
      return res.status(404).json({ error: 'Service not found or inactive' });
    }

    // Calculate end time
    const start = new Date(`${bookingDate}T${startTime}`);
    const end = new Date(start.getTime() + service.durationMinutes * 60000);

    // Validate booking (check conflicts, business hours, etc.)
    const validation = await validateBooking(serviceId, start, end);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Create or find customer
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address
        }
      });
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerId: customer.id,
        bookingDate: new Date(bookingDate),
        startTime: start,
        endTime: end,
        status: 'pending',
        confirmationCode,
        address,
        city,
        state,
        zipCode,
        apartmentUnit,
        specialNotes
      },
      include: {
        service: true,
        customer: true
      }
    });

    // Send confirmation email (async, don't wait)
    sendBookingConfirmation(booking).catch(err =>
      console.error('Failed to send confirmation email:', err)
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      confirmationCode
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        customer: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/confirmation/:code - Get booking by confirmation code
router.get('/confirmation/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { confirmationCode: code },
      include: {
        service: true,
        customer: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        service: true,
        customer: true
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings - Get all bookings (admin only)
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { status, from, to, limit = 50 } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.bookingDate = {};
      if (from) where.bookingDate.gte = new Date(from);
      if (to) where.bookingDate.lte = new Date(to);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: true
      },
      orderBy: { bookingDate: 'desc' },
      take: parseInt(limit)
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id - Update booking (admin only)
router.put('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, bookingDate, startTime, specialNotes } = req.body;

    const updateData = {};

    if (status) updateData.status = status;
    if (bookingDate) updateData.bookingDate = new Date(bookingDate);
    if (startTime) updateData.startTime = new Date(startTime);
    if (specialNotes !== undefined) updateData.specialNotes = specialNotes;

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        customer: true
      }
    });

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

export default router;
