import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-32">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
        Find Your Next Opportunity
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        Discover exciting jobs and connect with employers
        through JobBridge.
      </p>

      <Link
        href="/jobs"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold
        text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 
        focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
       Jobs
      </Link>
    </section>
  );
}