
import Link from "next/link";
import type { ReactNode } from "react";



export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold">JobBridge Dashboard</h1>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-[220px_1fr]">

        <aside className="rounded-lg border bg-white p-4">
          <nav aria-label="Dashboard navigation" className="space-y-2">
            <Link
              href="/dashboard/jobs"
              className="block rounded-md px-3 py-2 hover:bg-gray-100"
            >
              Jobs
            </Link>

            <Link
              href="/dashboard/members"
              className="block rounded-md px-3 py-2 hover:bg-gray-100"
            >
              Company Members
            </Link>

           
            <Link
              href="/dashboard/applications"
              className="block rounded-md px-3 py-2 hover:bg-gray-100"
            >
              Applications
            </Link>
            

            <Link
              href="/dashboard/profile"
              className="block rounded-md px-3 py-2 hover:bg-gray-100"
            >
              Profile
            </Link>

            <Link
              href="/dashboard/shortlist"
              className="block rounded-md px-3 py-2 hover:bg-gray-100"
            >
              Shortlist
            </Link>
          </nav>
        </aside>


        <main className="min-w-0 rounded-lg border bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
