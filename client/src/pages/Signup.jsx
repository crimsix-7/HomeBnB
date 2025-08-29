
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api.js';

export default function Signup({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest');
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await api.signup({ name, email, password, role });
      setToken(token); setUser(user);
      nav('/');
    } catch (e) { setError(e.message); }
  }

  return (
    <section>
      <h2>Create account</h2>
      <form onSubmit={onSubmit}>
        <label>Name <input value={name} onChange={e=>setName(e.target.value)} /></label>
        <label>Email <input value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Password <input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        <label>Role
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="guest">Guest</option>
            <option value="host">Host</option>
          </select>
        </label>
        {error && <p><small>{error}</small></p>}
        <button>Sign up</button>
      </form>
    </section>
  );
}
