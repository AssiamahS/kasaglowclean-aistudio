import express from 'express';
import prisma from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { getAvailableSlots } from '../services/availabilityService.js';

const router = express.Router();

// GET /api/availability/:serviceId/:date - Get available time slots for a service on a specific date (public)
router.get('/:serviceId/:date', async (req, res, next) => {
  try {
    const { serviceId, date } = req.params;

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const availableSlots = await getAvailableSlots(serviceId, date, service.durationMinutes);

    res.json({
      date,
      serviceId,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      slots: availableSlots
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/availability/time-slots - Get all time slots (admin)
router.get('/time-slots', authenticateAdmin, async (req, res, next) => {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json(timeSlots);
  } catch (error) {
    next(error);
  }
});

// POST /api/availability/time-slots - Create time slot (admin)
router.post('/time-slots', authenticateAdmin, async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: dayOfWeek, startTime, endTime'
      });
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      }
    });

    res.status(201).json(timeSlot);
  } catch (error) {
    next(error);
  }
});

// PUT /api/availability/time-slots/:id - Update time slot (admin)
router.put('/time-slots/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;

    const timeSlot = await prisma.timeSlot.update({
      where: { id },
      data: {
        ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(dayOfWeek) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(isAvailable !== undefined && { isAvailable })
      }
    });

    res.json(timeSlot);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/availability/time-slots/:id - Delete time slot (admin)
router.delete('/time-slots/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.timeSlot.delete({
      where: { id }
    });

    res.json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/availability/blocked-dates - Get all blocked dates (admin)
router.get('/blocked-dates', authenticateAdmin, async (req, res, next) => {
  try {
    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: { date: 'asc' }
    });

    res.json(blockedDates);
  } catch (error) {
    next(error);
  }
});

// POST /api/availability/blocked-dates - Create blocked date (admin)
router.post('/blocked-dates', authenticateAdmin, async (req, res, next) => {
  try {
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: new Date(date),
        reason
      }
    });

    res.status(201).json(blockedDate);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/availability/blocked-dates/:id - Delete blocked date (admin)
router.delete('/blocked-dates/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.blockedDate.delete({
      where: { id }
    });

    res.json({ message: 'Blocked date deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
