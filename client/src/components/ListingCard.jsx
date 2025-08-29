
import React from 'react';
import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const img = (listing.images || [])[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85';
  return (
    <div className="card">
      <img className="card-img" src={img + '?auto=format&fit=crop&w=1000&q=60'} alt={listing.title} />
      <div className="card-body">
        <div className="card-title">
          <strong>{listing.title}</strong>
          <div><small>{listing.city}, {listing.country}</small></div>
        </div>
        <p>{listing.description.slice(0, 100)}{listing.description.length > 100 ? '…' : ''}</p>
        <div className="card-footer">
          <Link to={`/listing/${listing.id}`}>View · ${listing.price_per_night}/night</Link>
        </div>
      </div>
    </div>
  );
}
