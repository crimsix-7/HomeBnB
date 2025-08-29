
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function NewListing({ user }) {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title:'', description:'', city:'', country:'', price_per_night:'',
    max_guests:'', bedrooms:'', bathrooms:'', amenities:'', images:''
  });
  const [msg, setMsg] = useState('');

  if (!user) return <p>Please log in as a host to create listings.</p>;
  if (user.role !== 'host') return <p>Host role required.</p>;

  function update(e) { setForm({...form, [e.target.name]: e.target.value}); }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 1),
        amenities: form.amenities.split(',').map(s=>s.trim()).filter(Boolean),
        images: form.images.split(',').map(s=>s.trim()).filter(Boolean),
      };
      const created = await api.createListing(payload);
      setMsg('Listing created!');
      nav(`/listing/${created.id}`);
    } catch (e) { setMsg(e.message); }
  }

  return (
    <section>
      <h2>New Listing</h2>
      <form onSubmit={onSubmit}>
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
          <label>Title<input name="title" value={form.title} onChange={update} /></label>
          <label>City<input name="city" value={form.city} onChange={update} /></label>
          <label>Country<input name="country" value={form.country} onChange={update} /></label>
          <label>Price/night<input name="price_per_night" type="number" value={form.price_per_night} onChange={update} /></label>
          <label>Max Guests<input name="max_guests" type="number" value={form.max_guests} onChange={update} /></label>
          <label>Bedrooms<input name="bedrooms" type="number" value={form.bedrooms} onChange={update} /></label>
          <label>Bathrooms<input name="bathrooms" type="number" value={form.bathrooms} onChange={update} /></label>
          <label>Images (comma-separated URLs)<input name="images" value={form.images} onChange={update} placeholder="https://..." /></label>
        </div>
        <label>Description<textarea name="description" value={form.description} onChange={update} rows="4" /></label>
        <label>Amenities (comma-separated)<input name="amenities" value={form.amenities} onChange={update} placeholder="Wifi, Parking, Washer" /></label>
        <button>Create</button>
      </form>
      {msg && <p><small>{msg}</small></p>}
    </section>
  );
}
