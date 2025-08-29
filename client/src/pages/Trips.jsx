
import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Trips({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user) api.myTrips().then(rows => { setList(rows); setLoading(false); }); }, [user]);
  if (!user) return <p>Please log in to see your trips.</p>;
  if (loading) return <p>Loading…</p>;
  return (
    <section>
      <h2>My Trips</h2>
      <div className="grid">
        {list.map(b => (
          <div className="card" key={b.id}>
            <img className="card-img" src={(b.images?.[0]||'') + '?auto=format&fit=crop&w=1000&q=60'} alt="" />
            <div className="card-body">
              <strong>{b.title}</strong>
              <p>{b.city}, {b.country}</p>
              <p><small>{b.start_date} → {b.end_date}</small></p>
              <p><small>Total: ${b.total_price}</small></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
