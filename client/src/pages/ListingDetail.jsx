
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function ListingDetail({ user }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  useEffect(() => { api.getListing(id).then(setItem); }, [id]);

  function nights() {
    if (!start || !end) return 0;
    const s = new Date(start), e = new Date(end);
    const ms = e - s;
    return Math.max(0, Math.ceil(ms/ (1000*60*60*24)));
  }

  async function book() {
    try {
      if (!user) return nav('/login');
      const res = await api.book({ listing_id: Number(id), start_date: start, end_date: end });
      setMsg(`Booked ${res.nights} nights. Total $${res.total_price}.`);
    } catch (e) { setMsg(e.message); }
  }

  if (!item) return <p>Loading…</p>;

  const imgs = item.images || [];
  const n = nights();
  const total = n * item.price_per_night;

  return (
    <section>
      <h2>{item.title}</h2>
      <p><strong>{item.city}, {item.country}</strong></p>
      <div className="grid">
        {imgs.map((url,i) => <img key={i} className="card-img" src={url+'?auto=format&fit=crop&w=1000&q=60'} alt="" />)}
      </div>
      <p>{item.description}</p>
      <p><small>Amenities: {item.amenities?.join(', ') || '—'}</small></p>

      <div className="card">
        <div className="card-body">
          <strong>${item.price_per_night}/night</strong>
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
            <label>Check-in <input type="date" value={start} onChange={e=>setStart(e.target.value)} /></label>
            <label>Check-out <input type="date" value={end} onChange={e=>setEnd(e.target.value)} /></label>
          </div>
          <div className="card-footer">
            <button onClick={book} disabled={!start||!end}>Book {n>0 ? `– $${total}` : ''}</button>
          </div>
          {msg && <p><small>{msg}</small></p>}
        </div>
      </div>
    </section>
  );
}
