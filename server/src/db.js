import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the data directory exists (works locally & on Render)
const dataDir = path.join(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });

// Open the DB file
const db = new Database(path.join(dataDir, 'database.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  price_per_night REAL NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  amenities TEXT NOT NULL,
  images TEXT NOT NULL,
  host_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (host_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

// Seed
const countListings = db.prepare('SELECT COUNT(*) as c FROM listings').get().c;
if (countListings === 0) {
  const countUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  let hostId;
  if (countUsers === 0) {
    const info = db.prepare(`INSERT INTO users (name, email, password_hash, role)
      VALUES (@name, @email, @password_hash, @role)`).run({
        name: 'Demo Host',
        email: 'host@example.com',
        // bcrypt hash of 'password'
        password_hash: '$2a$10$3FeD5eZyKq4T9WZjqz1jxu8ODHC6tDZQ1mNv5g3vQF1aQkq5Z82Qy',
        role: 'host'
      });
    hostId = info.lastInsertRowid;
  } else {
    const host = db.prepare("SELECT id FROM users WHERE role='host' LIMIT 1").get();
    hostId = host?.id || 1;
  }

  const seedListings = [
    {
      title: 'Cozy Downtown Studio',
      description: 'Walk to cafes and waterfront. Perfect for solo travelers.',
      city: "St. John's",
      country: 'Canada',
      price_per_night: 95,
      max_guests: 2,
      bedrooms: 0,
      bathrooms: 1,
      amenities: JSON.stringify(['Wifi','Heating','Kitchen']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511'
      ]),
      host_id: hostId
    },
    {
      title: 'Modern 2BR with Harbor View',
      description: 'Spacious 2-bedroom with balcony and harbor views.',
      city: 'Halifax',
      country: 'Canada',
      price_per_night: 180,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: JSON.stringify(['Wifi','Washer','Dryer','Free parking']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560066984-138dadb4c035',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
      ]),
      host_id: hostId
    },
    {
      title: 'Ski Chalet Retreat',
      description: 'Cozy chalet minutes from the slopes with fireplace.',
      city: 'Banff',
      country: 'Canada',
      price_per_night: 240,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: JSON.stringify(['Wifi','Fireplace','Hot tub']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
        'https://images.unsplash.com/photo-1560449752-3000e62f0e8b'
      ]),
      host_id: hostId
    }
  ];

  const insert = db.prepare(`INSERT INTO listings
    (title, description, city, country, price_per_night, max_guests, bedrooms, bathrooms, amenities, images, host_id)
    VALUES (@title,@description,@city,@country,@price_per_night,@max_guests,@bedrooms,@bathrooms,@amenities,@images,@host_id)`);
  const tx = db.transaction((rows) => { rows.forEach(r => insert.run(r)); });
  tx(seedListings);
}

export default db;
