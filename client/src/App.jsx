
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NewListing from './pages/NewListing.jsx';
import Trips from './pages/Trips.jsx';
import HostListings from './pages/HostListings.jsx';
import { api, getToken, setToken } from './api.js';

function Navbar({ user, setUser }) {
  const nav = useNavigate();
  function logout() { setToken(''); setUser(null); nav('/'); }
  return (
    <header className="container-narrow">
      <nav>
        <ul>
          <li><Link to="/"><strong>HomeBnB</strong></Link></li>
        </ul>
        <ul>
          <li><Link to="/">{'Explore'}</Link></li>
          {user?.role === 'host' && (
            <>
              <li><Link to="/host/new">New Listing</Link></li>
              <li><Link to="/host/listings">My Listings</Link></li>
            </>
          )}
          {user && <li><Link to="/trips">My Trips</Link></li>}
          {!user ? (
            <li><Link to="/login">Log in</Link></li>
          ) : (
            <li><button className="contrast" onClick={logout}>Log out</button></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => { if (getToken()) api.me().then(res => setUser(res.user)).catch(() => setUser(null)); }, []);
  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main className="container-narrow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listing/:id" element={<ListingDetail user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/host/new" element={<NewListing user={user} />} />
          <Route path="/host/listings" element={<HostListings user={user} />} />
          <Route path="/trips" element={<Trips user={user} />} />
        </Routes>
      </main>
    </>
  );
}
