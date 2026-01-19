import React, { useState } from 'react';
import { register } from '../pages/auth/auth';

export default function Register({ onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await register(name, email, password);
      onSuccess?.(user);
    } catch (error) {
      setErr(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">Register</h3>
      <form onSubmit={submit} className="space-y-4">
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {err && <p className="text-red-500">{err}</p>}
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
