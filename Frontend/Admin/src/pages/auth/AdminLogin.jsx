import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, clearError } from "../../store/slices/authSlice";
import api from "../../services/api";

const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id.apps.googleusercontent.com');

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
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
    await dispatch(login(data));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google/admin", {
        credential: credentialResponse.credential,
      });
      const { token, user } = res.data;
      dispatch({ type: "auth/login/fulfilled", payload: { token, user } });
    } catch (err) {
      dispatch({ type: "auth/login/rejected", payload: err.response?.data?.message || "Google login failed" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#031d44]">BQ-PLAY ADMIN</h1>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {hasGoogleClientId && (
            <>
              <div className="mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => dispatch({ type: "auth/login/rejected", payload: "Google sign-in failed" })}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold">or continue with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#031d44] hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/admin/register" className="text-blue-600 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
