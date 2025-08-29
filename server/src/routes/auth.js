
import express from 'express';
import db from '../db.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const info = db.prepare(`INSERT INTO users (name,email,password_hash,role) VALUES (@name,@email,@password_hash,@role)`)
      .run({ name, email, password_hash: hash, role: role === 'host' ? 'host' : 'guest' });
    const user = db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(info.lastInsertRowid);
    const token = signToken(user.id);
    res.json({ token, user });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const row = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  const token = signToken(user.id);
  res.json({ token, user });
});

export default router;
