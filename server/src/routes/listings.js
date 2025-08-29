
import express from 'express';
import db from '../db.js';

const router = express.Router();

function availabilityWhere(listingId, start, end) {
  return db.prepare(`SELECT COUNT(*) as c FROM bookings WHERE listing_id=? AND date(?) < date(end_date) AND date(?) > date(start_date)`)
           .get(listingId, start, end).c === 0;
}

router.get('/', (req, res) => {
  const { q, min_price, max_price, guests, start_date, end_date, city, country } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  if (q) { where += ' AND (title LIKE ? OR description LIKE ? OR city LIKE ? OR country LIKE ?)'; params.push(`%${q}%`,`%${q}%`,`%${q}%`,`%${q}%`); }
  if (min_price) { where += ' AND price_per_night >= ?'; params.push(Number(min_price)); }
  if (max_price) { where += ' AND price_per_night <= ?'; params.push(Number(max_price)); }
  if (guests) { where += ' AND max_guests >= ?'; params.push(Number(guests)); }
  if (city) { where += ' AND city LIKE ?'; params.push(`%${city}%`); }
  if (country) { where += ' AND country LIKE ?'; params.push(`%${country}%`); }

  const rows = db.prepare(`SELECT * FROM listings ${where} ORDER BY created_at DESC`).all(...params);
  let filtered = rows;
  if (start_date && end_date) filtered = rows.filter(r => availabilityWhere(r.id, start_date, end_date));
  const result = filtered.map(r => ({ ...r, amenities: JSON.parse(r.amenities || '[]'), images: JSON.parse(r.images || '[]') }));
  res.json(result);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const r = db.prepare('SELECT * FROM listings WHERE id=?').get(id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  r.amenities = JSON.parse(r.amenities || '[]');
  r.images = JSON.parse(r.images || '[]');
  res.json(r);
});

router.post('/', (req, res) => {
  const { title, description, city, country, price_per_night, max_guests, bedrooms, bathrooms, amenities, images } = req.body || {};
  const host_id = req.userId;
  if (!title || !description || !city || !country || !price_per_night || !max_guests) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const insert = db.prepare(`INSERT INTO listings
    (title,description,city,country,price_per_night,max_guests,bedrooms,bathrooms,amenities,images,host_id)
    VALUES (@title,@description,@city,@country,@price_per_night,@max_guests,@bedrooms,@bathrooms,@amenities,@images,@host_id)`);
  const info = insert.run({
    title, description, city, country,
    price_per_night: Number(price_per_night),
    max_guests: Number(max_guests),
    bedrooms: Number(bedrooms || 0),
    bathrooms: Number(bathrooms || 1),
    amenities: JSON.stringify(amenities || []),
    images: JSON.stringify(images || []),
    host_id
  });
  const created = db.prepare('SELECT * FROM listings WHERE id=?').get(info.lastInsertRowid);
  created.amenities = JSON.parse(created.amenities || '[]');
  created.images = JSON.parse(created.images || '[]');
  res.status(201).json(created);
});

export default router;
