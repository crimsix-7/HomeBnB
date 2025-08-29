
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setToken } from '../api.js';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await api.login({ email, password });
      setToken(token); setUser(user);
      nav('/');
    } catch (e) { setError(e.message); }
  }

  return (
    <section>
      <h2>Log in</h2>
      <form onSubmit={onSubmit}>
        <label>Email <input value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Password <input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        {error && <p><small>{error}</small></p>}
        <button>Log in</button>
      </form>
      <p><small>No account? <Link to="/signup">Create one</Link>.</small></p>
    </section>
  );
}
