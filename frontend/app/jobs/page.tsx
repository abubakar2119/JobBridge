// app/jobs/page.tsx
import { apiFetch } from '../lib/api';
import Link from 'next/link';

type Job = { id: string; title: string; company: { name: string }; created_at: string };

export default async function JobsPage() {
  const { jobs } = await apiFetch<{ jobs: Job[] }>('/api/public/jobs');

  return (
    <main>
      <h1>Open Positions</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <Link href={`/jobs/${job.id}`}>
              {job.title} — {job.company?.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}