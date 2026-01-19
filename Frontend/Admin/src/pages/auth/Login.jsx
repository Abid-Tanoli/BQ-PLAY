import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../services/api';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export default function Login({ onLogin }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'visionaryabidi@gmail.com',
      password: 'visionaryabidi@gmail.com'
    }
  });

  const submit = async (data) => {
  try {
    const res = await api.post('/auth/login', data);
    const { token, user } = res.data;
    if (onLogin) onLogin(token, user);
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    alert(err.response?.data?.message || "Network error: Cannot reach backend");
  }
};

  return (
    <div className="max-w-md mx-auto bg-slate-900 p-6 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input
            className="w-full p-2 rounded bg-slate-800"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && <div className="mt-1 text-xs text-red-400">{errors.email.message}</div>}
        </div>

        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-slate-800"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && <div className="mt-1 text-xs text-red-400">{errors.password.message}</div>}
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-emerald-500 text-black py-2 rounded font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}