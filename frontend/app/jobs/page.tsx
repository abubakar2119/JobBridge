
  import { apiFetch } from '../lib/api';
  import Link from 'next/link';

  type Job = {
    id: string;
    title: string;
    companyName: string;
    createdAt: string;
    description?: string;
    location: string;
    employmentType: string;
    salaryMin: number | null;
    salaryMax: number | null;
  };

  export default async function JobsPage() {
    const { jobs } = await apiFetch<{ jobs: Job[] }>(
      '/api/public/jobs'
    );

    return (
      <main className="px-4 py-8">

        
        <h1 className="mx-auto mt-4 w-fit rounded-xl bg-blue-200 p-4 text-3xl font-bold">
          Open Positions
        </h1>
          <ul className="mx-auto mt-6 grid max-w-3xl gap-4">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <Link
                href={`/jobs/${job.id}`}
                className="block text-lg font-semibold text-gray-800 hover:text-blue-600"
              >
                {job.title}
              </Link>

              <Link
                href={`/jobs/${job.id}`}
                className="block text-lg font-semibold text-gray-800 hover:text-blue-600"
              >
                
                {job.salaryMax}
              </Link>

              <p className="mt-2 text-sm text-gray-500">
                {job.companyName}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  {job.location}
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                  {job.employmentType.replace('_', ' ')}
                </span>
              </div>

            

              <p className="mt-3 text-xs text-gray-400">
                Posted: {job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString()
                  : 'Date not available'}
              </p>
            </li>
          ))}
        </ul>
      </main>
    );
  }
