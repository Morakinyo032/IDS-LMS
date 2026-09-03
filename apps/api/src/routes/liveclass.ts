import { Router, Response } from 'express';
import { prisma } from '@lms/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/liveclass - Schedule with Google Meet link
router.post(
  '/',
  authenticate(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, courseId, scheduledAt, duration, meetLink } = req.body;

      if (!title || !scheduledAt) {
        return res.status(400).json({ error: 'Title and scheduled time are required' });
      }

      if (meetLink && !meetLink.includes('meet.google.com')) {
        return res.status(400).json({ error: 'Please provide a valid Google Meet link' });
      }

      const liveClass = await prisma.liveClass.create({
        data: {
          title,
          description: description || '',
          courseId: courseId || null,
          scheduledAt: new Date(scheduledAt),
          duration: duration || 60,
          meetLink: meetLink || null,
        },
      });

      res.status(201).json({ liveClass });
    } catch (error) {
      console.error('Error creating live class:', error);
      res.status(500).json({ error: 'Failed to create live class' });
    }
  }
);

// GET /api/liveclass/course/:courseId
router.get('/course/:courseId', async (req, res: Response) => {
  try {
    const liveClasses = await prisma.liveClass.findMany({
      where: { courseId: req.params.courseId },
      orderBy: { scheduledAt: 'asc' },
    });
    res.json({ liveClasses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live classes' });
  }
});

// PUT /api/liveclass/:id
router.put(
  '/:id',
  authenticate(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, scheduledAt, duration, meetLink, isActive } = req.body;
      
      const liveClass = await prisma.liveClass.update({
        where: { id: req.params.id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
          ...(duration && { duration }),
          ...(meetLink !== undefined && { meetLink }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ liveClass });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update live class' });
    }
  }
);

// DELETE /api/liveclass/:id
router.delete(
  '/:id',
  authenticate(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      await prisma.liveClass.delete({ where: { id: req.params.id } });
      res.json({ message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete' });
    }
  }
);

// PUT /api/liveclass/:id/start
router.put(
  '/:id/start',
  authenticate(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const liveClass = await prisma.liveClass.update({
        where: { id: req.params.id },
        data: { isActive: true },
      });
      res.json({ liveClass });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start class' });
    }
  }
);

// PUT /api/liveclass/:id/end
router.put(
  '/:id/end',
  authenticate(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const liveClass = await prisma.liveClass.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });
      res.json({ liveClass });
    } catch (error) {
      res.status(500).json({ error: 'Failed to end class' });
    }
  }
);

export default router;