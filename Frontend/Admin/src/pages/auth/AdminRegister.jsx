import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../services/api";
import { Link } from "react-router-dom";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminRegister() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const submit = async (data) => {
    try {
      await api.post("/register", data);
      alert("Admin registered successfully");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit(submit)}
        className="bg-slate-900 p-6 rounded-lg w-96 text-white space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Admin Register</h2>
        
        <div>
          <input
            {...register("name")}
            placeholder="Name"
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold transition-colors"
        >
          {isSubmitting ? "Creating..." : "Register"}
        </button>

        <div className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
}