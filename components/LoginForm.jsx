"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials");
        return;
      }

      router.replace("dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="bg-green-600 py-4">
          <h1 className="text-center text-2xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="text-center text-green-100 text-sm mt-1">
            Sign in to continue to your account
          </p>
        </div>

        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              className="text-sm text-gray-600 hover:text-green-600 transition-colors"
              href="/register"
            >
              Don't have an account?{" "}
              <span className="font-medium text-green-600">Register now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
