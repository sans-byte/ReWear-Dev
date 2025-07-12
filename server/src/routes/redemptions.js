import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const createRedemptionSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  pointsUsed: z.number().min(1, 'Points must be greater than 0'),
});

// Create redemption request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { itemId, pointsUsed } = createRedemptionSchema.parse(req.body);

    // Verify item exists and is available
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.uploaderId === req.user.id) {
      return res.status(400).json({ error: 'You cannot redeem your own item' });
    }

    if (item.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Item is not available for redemption' });
    }

    // Check if user has enough points
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (user.points < pointsUsed) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Check if redemption already exists
    const existingRedemption = await prisma.redemption.findFirst({
      where: {
        itemId,
        userId: req.user.id,
        status: 'PENDING',
      },
    });

    if (existingRedemption) {
      return res.status(400).json({ error: 'Redemption request already exists' });
    }

    const redemption = await prisma.$transaction(async (tx) => {
      // Create redemption
      const newRedemption = await tx.redemption.create({
        data: {
          itemId,
          userId: req.user.id,
          pointsUsed,
        },
        include: {
          item: {
            include: {
              uploader: {
                select: { id: true, name: true },
              },
            },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      });

      // Deduct points from user
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          points: {
            decrement: pointsUsed,
          },
        },
      });

      // Mark item as pending
      await tx.item.update({
        where: { id: itemId },
        data: {
          status: 'PENDING',
        },
      });

      return newRedemption;
    });

    res.status(201).json(redemption);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create redemption error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get redemption requests for item owner
router.get('/incoming', authenticateToken, async (req, res) => {
  try {
    const redemptions = await prisma.redemption.findMany({
      where: {
        item: {
          uploaderId: req.user.id,
        },
      },
      include: {
        item: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(redemptions);
  } catch (error) {
    console.error('Get incoming redemptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update redemption status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = z.object({
      status: z.enum(['APPROVED', 'REJECTED']),
    }).parse(req.body);

    const redemption = await prisma.redemption.findUnique({
      where: { id: req.params.id },
      include: {
        item: true,
        user: true,
      },
    });

    if (!redemption) {
      return res.status(404).json({ error: 'Redemption not found' });
    }

    if (redemption.item.uploaderId !== req.user.id) {
      return res.status(403).json({ error: 'Only the item owner can update redemption status' });
    }

    if (redemption.status !== 'PENDING') {
      return res.status(400).json({ error: 'Redemption has already been processed' });
    }

    const updatedRedemption = await prisma.$transaction(async (tx) => {
      // Update redemption status
      const updated = await tx.redemption.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          item: {
            include: {
              uploader: {
                select: { id: true, name: true },
              },
            },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      });

      if (status === 'APPROVED') {
        // Mark item as redeemed
        await tx.item.update({
          where: { id: redemption.itemId },
          data: {
            status: 'REDEEMED',
          },
        });

        // Give points to item owner
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            points: {
              increment: redemption.pointsUsed,
            },
          },
        });
      } else {
        // Return points to user and make item available again
        await tx.user.update({
          where: { id: redemption.userId },
          data: {
            points: {
              increment: redemption.pointsUsed,
            },
          },
        });

        await tx.item.update({
          where: { id: redemption.itemId },
          data: {
            status: 'AVAILABLE',
          },
        });
      }

      return updated;
    });

    res.json(updatedRedemption);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update redemption status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;