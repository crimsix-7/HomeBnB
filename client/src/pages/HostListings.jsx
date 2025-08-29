
import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import ListingCard from '../components/ListingCard.jsx';

export default function HostListings({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user) api.myHostListings().then(rows => { setList(rows); setLoading(false); }); }, [user]);
  if (!user) return <p>Please log in as a host.</p>;
  if (user.role !== 'host') return <p>Host role required.</p>;
  if (loading) return <p>Loading…</p>;
  return (
    <section>
      <h2>My Listings</h2>
      <div className="grid">
        {list.map(l => <ListingCard key={l.id} listing={l} />)}
      </div>
    </section>
  );
}
