import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import  api  from "../../services/api";
import { Link } from "react-router-dom";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin({ onLogin }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const submit = async (data) => {
    try {
      const res = await api.post("/login", data);
      const { token, admin } = res.data;
      if (onLogin) {
        onLogin(token, admin);
      } else {
         localStorage.setItem("bq_token", token);
         localStorage.setItem("bq_user", JSON.stringify(admin));
         window.location.href = "/";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Admin login failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit(submit)}
        className="bg-slate-900 p-6 rounded-lg w-96 text-white space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Admin Login</h2>
        
        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-semibold transition-colors"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <div className="text-center text-sm text-slate-400 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
}