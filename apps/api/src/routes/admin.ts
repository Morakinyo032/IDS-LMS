import { Router, Response } from 'express';
import { prisma } from '@lms/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/admin/pending-instructors
router.get(
  '/pending-instructors',
  authenticate(['ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const instructors = await prisma.user.findMany({
        where: { role: 'PENDING_INSTRUCTOR' },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ instructors });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch' });
    }
  }
);

// PUT /api/admin/instructors/:id/approve
router.put(
  '/instructors/:id/approve',
  authenticate(['ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const instructor = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          role: 'INSTRUCTOR',
          approved: true,
          approvedBy: req.user!.userId,
          approvedAt: new Date(),
        },
      });
      res.json({ instructor });
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve' });
    }
  }
);

// DELETE /api/admin/instructors/:id/reject
router.delete(
  '/instructors/:id/reject',
  authenticate(['ADMIN', 'SUPER_ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: 'Application rejected' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reject' });
    }
  }
);

export default router;