import Link from "next/link";

export default function Navbar() {
    return (
        <header className="border-b border-gray-200 bg-white">
            <nav
                aria-label="Main navigation"
                className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
            >
                <Link
                    href="/"
                    className="text-2xl font-bold text-blue-600"
                >
                    JobBridge
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/jobs"
                        className="rounded-lg bg-blue-600 px-4 py-2 
            font-medium text-white hover:bg-blue-700 focus-visible:outline-2 
            focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Jobs
                    </Link>

                    <Link
                        href="/login"
                        className="rounded-lg bg-blue-600 px-4 py-2 
            font-medium text-white hover:bg-blue-700 focus-visible:outline-2 
            focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="rounded-lg bg-blue-600 px-4 py-2 
            font-medium text-white hover:bg-blue-700 focus-visible:outline-2 
            focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Register
                    </Link>
                </div>
            </nav>
        </header>
    );
}