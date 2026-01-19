import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../services/api";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function AdminLogin({ onLogin }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const submit = async (data) => {
    try {
      const res = await api.post("/login", data);
      const { token, admin } = res.data;

      onLogin(token, admin);
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

        <input
          {...register("email")}
          placeholder="Email"
          className="w-full p-2 rounded bg-slate-800"
        />

        <input
          type="password"
          {...register("password")}
          placeholder="Password"
          className="w-full p-2 rounded bg-slate-800"
        />

        <button
          disabled={isSubmitting}
          className="w-full bg-emerald-500 text-black py-2 rounded font-semibold"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
