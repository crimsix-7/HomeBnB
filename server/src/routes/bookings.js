
import express from 'express';
import db from '../db.js';

const router = express.Router();

function nightsBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e - s;
  return Math.max(0, Math.ceil(ms / (1000*60*60*24)));
}
function isAvailable(listingId, start, end) {
  const overlap = db.prepare(`SELECT COUNT(*) as c FROM bookings WHERE listing_id=? AND date(?) < date(end_date) AND date(?) > date(start_date)`)
    .get(listingId, start, end).c;
  return overlap === 0;
}

router.get('/me', (req, res) => {
  const uid = req.userId;
  const rows = db.prepare(`
    SELECT b.*, l.title, l.city, l.country, l.images
    FROM bookings b JOIN listings l ON b.listing_id = l.id
    WHERE b.user_id=? ORDER BY b.created_at DESC
  `).all(uid).map(r => ({...r, images: JSON.parse(r.images || '[]')}));
  res.json(rows);
});

router.post('/', (req, res) => {
  const { listing_id, start_date, end_date } = req.body || {};
  if (!listing_id || !start_date || !end_date) return res.status(400).json({ error: 'Missing fields' });

  const listing = db.prepare('SELECT * FROM listings WHERE id=?').get(listing_id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (!isAvailable(listing_id, start_date, end_date)) return res.status(409).json({ error: 'Dates not available' });

  const nights = nightsBetween(start_date, end_date);
  if (nights <= 0) return res.status(400).json({ error: 'Invalid date range' });
  const total = Math.round(nights * listing.price_per_night * 100) / 100;

  const info = db.prepare(`INSERT INTO bookings (listing_id, user_id, start_date, end_date, total_price, status)
    VALUES (@listing_id, @user_id, @start_date, @end_date, @total_price, 'confirmed')`)
    .run({ listing_id, user_id: req.userId, start_date, end_date, total_price: total });

  const created = db.prepare('SELECT * FROM bookings WHERE id=?').get(info.lastInsertRowid);
  res.status(201).json({ ...created, nights, listing_title: listing.title });
});

export default router;
