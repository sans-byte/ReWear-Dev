import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalItems, totalSwaps, totalRedemptions] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.swap.count(),
      prisma.redemption.count(),
    ]);

    const itemsByStatus = await prisma.item.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    res.json({
      totalUsers,
      totalItems,
      totalSwaps,
      totalRedemptions,
      itemsByStatus,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all items for moderation
router.get('/items', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const items = await prisma.item.findMany({
      where,
      skip,
      take: limit,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        adminActions: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.item.count({ where });

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Moderate item
router.post('/items/:id/moderate', async (req, res) => {
  try {
    const { actionType, reason } = z.object({
      actionType: z.enum(['APPROVE', 'REJECT', 'REMOVE', 'RESTORE']),
      reason: z.string().optional(),
    }).parse(req.body);

    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    let newStatus = item.status;
    if (actionType === 'APPROVE') {
      newStatus = 'AVAILABLE';
    } else if (actionType === 'REJECT' || actionType === 'REMOVE') {
      newStatus = 'REMOVED';
    } else if (actionType === 'RESTORE') {
      newStatus = 'AVAILABLE';
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update item status
      const updatedItem = await tx.item.update({
        where: { id: req.params.id },
        data: { status: newStatus },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create admin action record
      await tx.adminAction.create({
        data: {
          adminId: req.user.id,
          itemId: req.params.id,
          actionType,
          reason,
        },
      });

      return updatedItem;
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Moderate item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            swapsOffered: true,
            redemptions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.user.count();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;