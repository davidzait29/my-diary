import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { supabase } from '../utils/supabase.js';
import { authenticate, requireMaster } from '../middleware/auth.js';

export const authRouter = express.Router();

// Rate limiter: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const { data, error } = await supabase
      .from('owner')
      .select('id, password_hash, visitor_password_hash')
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Incorrect PIN' });
    }

    // Check master password first
    const isMaster = await bcrypt.compare(password, data.password_hash);
    if (isMaster) {
      const token = jwt.sign(
        { ownerId: data.id, role: 'master' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
      );
      return res.json({ token, role: 'master', expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
    }

    // Check visitor password
    if (data.visitor_password_hash) {
      const isVisitor = await bcrypt.compare(password, data.visitor_password_hash);
      if (isVisitor) {
        const token = jwt.sign(
          { ownerId: data.id, role: 'visitor' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
        );
        return res.json({ token, role: 'visitor', expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
      }
    }

    // Neither matched — same error for both (don't reveal which is wrong)
    return res.status(401).json({ error: 'Incorrect PIN' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token — also returns role so frontend knows permissions
authRouter.get('/verify', authenticate, (req, res) => {
  res.json({ valid: true, role: req.user.role });
});

// Change MASTER password — master only
authRouter.post('/change-password', authenticate, requireMaster, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }

    const { data } = await supabase
      .from('owner')
      .select('id, password_hash')
      .limit(1)
      .single();

    const valid = await bcrypt.compare(currentPassword, data.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 12);
    await supabase.from('owner').update({ password_hash: hash }).eq('id', data.id);

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change VISITOR password — master only
authRouter.post('/change-visitor-password', authenticate, requireMaster, async (req, res) => {
  try {
    const { currentPassword, newVisitorPassword } = req.body;
    if (!currentPassword || !newVisitorPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    if (newVisitorPassword.length < 4) {
      return res.status(400).json({ error: 'Visitor password must be at least 4 characters' });
    }

    const { data } = await supabase
      .from('owner')
      .select('id, password_hash')
      .limit(1)
      .single();

    // Verify master password before changing visitor password
    const valid = await bcrypt.compare(currentPassword, data.password_hash);
    if (!valid) return res.status(401).json({ error: 'Master password is incorrect' });

    const hash = await bcrypt.hash(newVisitorPassword, 12);
    await supabase.from('owner').update({ visitor_password_hash: hash }).eq('id', data.id);

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
