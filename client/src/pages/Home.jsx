
import React, { useEffect, useState } from 'react';
import ListingCard from '../components/ListingCard.jsx';
import { api } from '../api.js';

export default function Home() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [guests, setGuests] = useState('');

  async function load() {
    setLoading(true);
    const data = await api.listListings({ q, city, guests });
    setList(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <section>
      <h2>Explore stays</h2>
      <form onSubmit={e => { e.preventDefault(); load(); }}>
        <div className="grid" style={{gridTemplateColumns:'2fr 1fr 1fr 1fr'}}>
          <input placeholder="Search (city, country, title…)" value={q} onChange={e=>setQ(e.target.value)} />
          <input placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
          <input type="number" min="1" placeholder="Guests" value={guests} onChange={e=>setGuests(e.target.value)} />
          <button type="submit">Search</button>
        </div>
      </form>
      <div className="grid" style={{marginTop:'1rem'}}>
        {loading ? <p>Loading…</p> : list.length === 0 ? <p>No listings found.</p> : list.map(l => <ListingCard key={l.id} listing={l} />)}
      </div>
    </section>
  );
}
