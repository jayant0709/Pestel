"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function UserInfo() {
  const { data: session } = useSession();

  return (
    <div className="flex justify-center items-center p-5 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="shadow-lg p-6 bg-white rounded-2xl flex flex-col gap-3 max-w-md w-full border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-xl font-bold text-white uppercase">
              {session?.user?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {session?.user?.name}
            </h1>
            <p className="text-gray-500 text-sm">{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-gray-50 p-3 rounded-xl">
            <h2 className="text-xs font-medium text-gray-500 mb-1">
              Full Name
            </h2>
            <p className="text-gray-800 font-medium text-sm truncate">
              {session?.user?.name}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl">
            <h2 className="text-xs font-medium text-gray-500 mb-1">
              Email Address
            </h2>
            <p className="text-gray-800 font-medium text-sm truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-5 py-2.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
