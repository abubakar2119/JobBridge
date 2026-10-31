'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto mt-6 mb-4 w-fit rounded-2xl
       px-6 py-3 text-2xl font-bold">
      <h2>Unable to load jobs</h2>
      <p>Please try again.</p>

      <button onClick={() => reset()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition
       hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        Try again
      </button>
    </div>
  );
}