import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/admin/register - Register new admin (first time setup or by existing admin)
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: username, email, password'
      });
    }

    // Check if any admin exists
    const adminCount = await prisma.admin.count();

    // If admins exist, require authentication
    if (adminCount > 0) {
      // You could add authenticateAdmin middleware here if you want only admins to create other admins
      return res.status(403).json({
        error: 'Admin registration is closed. Contact existing admin.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/login - Admin login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/me - Get current admin info
router.get('/me', authenticateAdmin, async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    res.json(admin);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', authenticateAdmin, async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    // Get booking counts
    const [
      todayBookings,
      weekBookings,
      pendingBookings,
      totalRevenue,
      totalBookings
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          bookingDate: { gte: todayStart },
          status: { not: 'cancelled' }
        }
      }),
      prisma.booking.count({
        where: {
          bookingDate: { gte: weekStart },
          status: { not: 'cancelled' }
        }
      }),
      prisma.booking.count({
        where: { status: 'pending' }
      }),
      prisma.booking.findMany({
        where: { status: 'completed' },
        include: { service: true }
      }).then(bookings =>
        bookings.reduce((sum, booking) => sum + booking.service.price, 0)
      ),
      prisma.booking.count()
    ]);

    // Get popular services
    const bookingsByService = await prisma.booking.groupBy({
      by: ['serviceId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const popularServices = await Promise.all(
      bookingsByService.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId }
        });
        return {
          service: service?.name,
          bookings: item._count.id
        };
      })
    );

    res.json({
      todayBookings,
      weekBookings,
      pendingBookings,
      totalRevenue,
      totalBookings,
      popularServices
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/customers - Get all customers
router.get('/customers', authenticateAdmin, async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        bookings: {
          include: {
            service: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(customers);
  } catch (error) {
    next(error);
  }
});

export default router;
