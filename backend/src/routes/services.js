import express from 'express';
import prisma from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/services - Get all active services (public)
router.get('/', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json(services);
  } catch (error) {
    next(error);
  }
});

// GET /api/services/:id - Get service by ID (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    next(error);
  }
});

// POST /api/services - Create new service (admin only)
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { name, description, durationMinutes, price, active } = req.body;

    if (!name || !description || !durationMinutes || !price) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, durationMinutes, price'
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        durationMinutes: parseInt(durationMinutes),
        price: parseFloat(price),
        active: active !== undefined ? active : true
      }
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

// PUT /api/services/:id - Update service (admin only)
router.put('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, durationMinutes, price, active } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(durationMinutes && { durationMinutes: parseInt(durationMinutes) }),
        ...(price && { price: parseFloat(price) }),
        ...(active !== undefined && { active })
      }
    });

    res.json(service);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/services/:id - Delete service (admin only)
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({
      where: { id }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
