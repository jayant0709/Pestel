"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header({ session }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-sm">
      <div className="flex items-center justify-between h-full px-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2.5"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-purple-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PESTEL Analysis
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome,{" "}
                </span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {session.user?.name}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
