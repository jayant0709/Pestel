"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function UserInfo() {
  const { data: session } = useSession();

  return (
    <div className="grid place-items-center h-screen bg-gray-100">
      <div className="shadow-lg p-8 bg-white rounded-lg flex flex-col gap-4 my-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          User Information
        </h1>
        <div className="text-lg">
          Name:{" "}
          <span className="font-semibold text-gray-700">
            {session?.user?.name}
          </span>
        </div>
        <div className="text-lg">
          Email:{" "}
          <span className="font-semibold text-gray-700">
            {session?.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-600 text-white font-bold px-6 py-2 mt-4 rounded hover:bg-red-700 transition duration-300"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
