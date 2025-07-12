import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's items
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { uploaderId: req.user.id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(items);
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's swaps
router.get('/swaps', authenticateToken, async (req, res) => {
  try {
    const swaps = await prisma.swap.findMany({
      where: {
        OR: [
          { requesterId: req.user.id },
          { responderId: req.user.id },
        ],
      },
      include: {
        itemOffered: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        itemRequested: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
        responder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(swaps);
  } catch (error) {
    console.error('Get user swaps error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's redemptions
router.get('/redemptions', authenticateToken, async (req, res) => {
  try {
    const redemptions = await prisma.redemption.findMany({
      where: { userId: req.user.id },
      include: {
        item: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(redemptions);
  } catch (error) {
    console.error('Get user redemptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;