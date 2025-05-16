"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-sm">
      <div className="flex items-center h-full mx-auto max-w-7xl px-6">
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 mr-auto"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-400 shadow-md shadow-blue-400/20">
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
          <span className="text-xl font-bold text-blue-400">
            PESTEL Analysis
          </span>
        </Link>

        {session && (
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome,{" "}
              </span>
              <span className="text-sm font-medium text-blue-400">
                {session.user?.name}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-400 rounded-lg shadow-md shadow-blue-400/20 hover:shadow-lg hover:shadow-blue-400/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
