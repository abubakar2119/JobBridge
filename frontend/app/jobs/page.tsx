// app/jobs/page.tsx
import { apiFetch } from '../lib/api';
import Link from 'next/link';

type Job = { id: string; title: string; company: { name: string }; created_at: string };

export default async function JobsPage() {
  const { jobs } = await apiFetch<{ jobs: Job[] }>('/api/public/jobs');

  return (
    <main >

      <h1 className='flex justify-center p-4 mt-4 text-3xl font-bold 
      rounded-xl bg-blue-200 w-fit ml-180 cursor-pointer'>Open Positions</h1>

      <ul className="mx-auto mt-6 grid max-w-3xl gap-4 px-4">

        {jobs.map((job) => (

          <li key={job.id} className="rounded-xl border border-gray-200
           bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <Link href={`/jobs/${job.id}`} className="block text-lg font-semibold text-gray-800 hover:text-blue-600">

              {job.title}

            </Link>

            <p className="mt-2 text-sm text-gray-500">{job.company?.name} </p>
          </li>
        ))}
      </ul>
    </main>
  );
}