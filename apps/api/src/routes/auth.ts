import { Router, Request, Response } from 'express'
import { prisma }       from '@lms/database'
import bcrypt           from 'bcryptjs'
import jwt              from 'jsonwebtoken'
import { z }            from 'zod'
import { sendWelcomeEmail } from '../services/email';


const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345'
const JWT_EXPIRES: any = process.env.JWT_EXPIRES_IN || '7d'

//console.log('JWT_SECRET exists:', !!JWT_SECRET)

// Schemas
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
})
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    
    // Determine role and approval status
    const requestedRole = role === 'INSTRUCTOR' ? 'PENDING_INSTRUCTOR' : 'STUDENT';
    const isApproved = role !== 'INSTRUCTOR';  // Auto-approve students

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        role: requestedRole as any,
        approved: isApproved,
      },
    });

    // If instructor, don't give them a token yet
    if (role === 'INSTRUCTOR') {
      return res.status(201).json({
        message: 'Your instructor application is pending approval. You will be notified once approved.',
        pendingApproval: true,
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.schoolId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES as any }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (err) {
    res.status(400).json({ error: (err as any).message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    // Block pending instructors
    if (user.role === 'PENDING_INSTRUCTOR' || !user.approved) {
      return res.status(403).json({ 
        error: 'Your account is pending approval. Please contact the administrator.' 
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.schoolId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES as any }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
      },
    });
  } catch (err) {
    res.status(400).json({ error: (err as any).message });
  }
});

export default router