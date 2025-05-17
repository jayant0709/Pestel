"use client";
import Link from "next/link";
import Image from "next/image";
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
      <div className="flex items-center h-full px-6">
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-center gap-3"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Image
              src="/pestel_logo.png"
              alt="PESTEL Analysis Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            PESTEL Analysis
          </span>
        </Link>

        {session && (
          <div className="flex items-center gap-5 ml-auto">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full shadow-inner">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {session.user?.name || session.user?.email}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
