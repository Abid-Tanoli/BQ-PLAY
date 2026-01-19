import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../services/api";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function AdminRegister() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const submit = async (data) => {
    try {
      await api.post("/register", data);
      alert("Admin registered successfully");
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

        <input
          {...register("name")}
          placeholder="Name"
          className="w-full p-2 rounded bg-slate-800"
        />

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
          className="w-full bg-blue-500 text-black py-2 rounded font-semibold"
        >
          {isSubmitting ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
}
