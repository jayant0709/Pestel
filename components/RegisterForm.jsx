"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }

    try {
      const resUserExists = await fetch("api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("User already exists.");
        return;
      }

      const res = await fetch("api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (res.ok) {
        const form = e.target;
        form.reset();
        router.push("/");
      } else {
        console.log("User registration failed.");
      }
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="bg-green-600 py-4">
          <h1 className="text-center text-2xl font-bold text-white">
            Create Account
          </h1>
          <p className="text-center text-green-100 text-sm mt-1">
            Sign up to get started
          </p>
        </div>

        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
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
              Register
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              className="text-sm text-gray-600 hover:text-green-600 transition-colors"
              href="/"
            >
              Already have an account?{" "}
              <span className="font-medium text-green-600">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
