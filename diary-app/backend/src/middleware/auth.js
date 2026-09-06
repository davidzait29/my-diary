import jwt from 'jsonwebtoken';

// Verify JWT — attach user (with role) to req
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { ownerId, role: 'master' | 'visitor' }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// Only allow master role — blocks visitors from write actions
export function requireMaster(req, res, next) {
  if (req.user?.role !== 'master') {
    return res.status(403).json({ error: 'This action requires master access' });
  }
  next();
}
