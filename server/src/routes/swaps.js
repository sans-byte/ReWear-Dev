import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const createSwapSchema = z.object({
  itemOfferedId: z.string().min(1, 'Offered item ID is required'),
  itemRequestedId: z.string().min(1, 'Requested item ID is required'),
});

// Create swap request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { itemOfferedId, itemRequestedId } = createSwapSchema.parse(req.body);

    // Verify items exist and are available
    const [itemOffered, itemRequested] = await Promise.all([
      prisma.item.findUnique({ where: { id: itemOfferedId } }),
      prisma.item.findUnique({ where: { id: itemRequestedId } }),
    ]);

    if (!itemOffered || !itemRequested) {
      return res.status(404).json({ error: 'One or both items not found' });
    }

    if (itemOffered.uploaderId !== req.user.id) {
      return res.status(403).json({ error: 'You can only offer your own items' });
    }

    if (itemRequested.uploaderId === req.user.id) {
      return res.status(400).json({ error: 'You cannot request your own item' });
    }

    if (itemOffered.status !== 'AVAILABLE' || itemRequested.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'One or both items are not available' });
    }

    // Check if swap already exists
    const existingSwap = await prisma.swap.findFirst({
      where: {
        itemOfferedId,
        itemRequestedId,
        status: 'PENDING',
      },
    });

    if (existingSwap) {
      return res.status(400).json({ error: 'Swap request already exists' });
    }

    const swap = await prisma.swap.create({
      data: {
        itemOfferedId,
        itemRequestedId,
        requesterId: req.user.id,
        responderId: itemRequested.uploaderId,
      },
      include: {
        itemOffered: {
          include: {
            uploader: {
              select: { id: true, name: true },
            },
          },
        },
        itemRequested: {
          include: {
            uploader: {
              select: { id: true, name: true },
            },
          },
        },
        requester: {
          select: { id: true, name: true },
        },
        responder: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json(swap);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create swap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update swap status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = z.object({
      status: z.enum(['ACCEPTED', 'REJECTED']),
    }).parse(req.body);

    const swap = await prisma.swap.findUnique({
      where: { id: req.params.id },
      include: {
        itemOffered: true,
        itemRequested: true,
      },
    });

    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    if (swap.responderId !== req.user.id) {
      return res.status(403).json({ error: 'Only the responder can update swap status' });
    }

    if (swap.status !== 'PENDING') {
      return res.status(400).json({ error: 'Swap has already been processed' });
    }

    const updatedSwap = await prisma.$transaction(async (tx) => {
      // Update swap status
      const updated = await tx.swap.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          itemOffered: {
            include: {
              uploader: {
                select: { id: true, name: true },
              },
            },
          },
          itemRequested: {
            include: {
              uploader: {
                select: { id: true, name: true },
              },
            },
          },
          requester: {
            select: { id: true, name: true },
          },
          responder: {
            select: { id: true, name: true },
          },
        },
      });

      // If accepted, mark items as swapped
      if (status === 'ACCEPTED') {
        await tx.item.updateMany({
          where: {
            id: {
              in: [swap.itemOfferedId, swap.itemRequestedId],
            },
          },
          data: {
            status: 'SWAPPED',
          },
        });
      }

      return updated;
    });

    res.json(updatedSwap);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update swap status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;