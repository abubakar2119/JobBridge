// app/dashboard/applications/page.tsx
import { apiFetch } from '../../lib/api';

const STAGE_COLOURS: Record<string, string> = {
  applied:         'bg-gray-200',
  screening:       'bg-blue-200',
  interview:       'bg-yellow-200',
  final_interview: 'bg-orange-200',
  offer:           'bg-green-200',
  hired:           'bg-green-500',
  rejected:        'bg-red-200',
};

export default async function ApplicationsPage() {
  const { applications } = await apiFetch<{ applications: any[] }>('/api/applicants/applications');

  return (
    <main>
      <h1 className="mx-auto mt-6 mb-4 w-fit rounded-2xl bg-blue-600
       px-6 py-3 text-2xl font-bold text-white">My Applications</h1>
      <ul className="mx-auto mt-6 grid max-w-3xl gap-4 px-4">
        {applications.map((app) => (
          <li key={app.id} className="rounded-xl border border-gray-200
           bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <span className="block text-lg font-semibold text-gray-800 hover:text-blue-600">{app.job_title} — {app.company_name}</span>
            <span className={`badge ${STAGE_COLOURS[app.stage] ?? ''}`}>{app.stage}</span>
            {app.upcoming_interview && (
              <span>Interview: {new Date(app.upcoming_interview.scheduled_at).toLocaleString()}</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}



