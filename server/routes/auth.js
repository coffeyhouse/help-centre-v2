import express from 'express';

const router = express.Router();

// Simple password stored in environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Login endpoint
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    // In a real app, you'd generate a JWT token here
    // For MVP, we'll just return a simple token
    const token = Buffer.from(`${password}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

// Verify token middleware (exported for use in other routes)
export const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [password] = decoded.split(':');

    if (password === ADMIN_PASSWORD) {
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
};

export default router;
