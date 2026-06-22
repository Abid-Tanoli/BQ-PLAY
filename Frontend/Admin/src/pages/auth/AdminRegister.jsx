import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register as registerAction, clearError } from "../../store/slices/authSlice";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  useEffect(() => {
    if (token) {
      navigate("/admin");
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    await dispatch(registerAction({
      name: data.name,
      email: data.email,
      password: data.password,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#031d44]">CREATE ACCOUNT</h1>
            <p className="text-slate-500 mt-2">Join BQ-PLAY Admin Panel</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Full Name
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-2 text-xs text-red-600 font-bold">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                placeholder="admin@bqplay.com"
              />
              {errors.email && (
                <p className="mt-2 text-xs text-red-600 font-bold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-xs text-red-600 font-bold">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-600 font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#031d44] hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/admin/login" className="text-blue-600 font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
