
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import authRouter from './routes/auth.js';
import listingsRouter from './routes/listings.js';
import bookingsRouter from './routes/bookings.js';
import { authRequired } from './auth.js';

dotenv.config();
const app = express();

// Allow origins via env var ALLOWED_ORIGINS="https://site1,https://site2"
const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server or local tools (no origin)
    if (!origin) return cb(null, true);
    const ok = allowed.some(a => origin === a || origin.startsWith(a));
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, message: 'API up' }));

// Auth
app.use('/api/auth', authRouter);
app.get('/api/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(req.userId);
  res.json({ user });
});

// Listings
app.use('/api/listings', listingsRouter);

// Host listings
app.get('/api/host/listings', authRequired, (req, res) => {
  const roleRow = db.prepare('SELECT role FROM users WHERE id=?').get(req.userId);
  if (roleRow?.role !== 'host') return res.status(403).json({ error: 'Host role required' });
  const rows = db.prepare('SELECT * FROM listings WHERE host_id=? ORDER BY created_at DESC').all(req.userId)
    .map(r => ({...r, amenities: JSON.parse(r.amenities||'[]'), images: JSON.parse(r.images||'[]')}));
  res.json(rows);
});

// Bookings
app.get('/api/trips', authRequired, (req, res) => bookingsRouter.handle(req, res));
app.post('/api/bookings', authRequired, (req, res) => bookingsRouter.handle(req, res));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
