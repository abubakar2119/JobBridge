
import { apiFetch } from '../../lib/api';

type ShortlistItem = {
  id: string;
  job_id: string;
  title: string;
  company_name: string;
  created_at: string;
};

export default async function ShortlistPage() {
  const { shortlist } = await apiFetch<{
    shortlist: ShortlistItem[];
  }>('/api/applicants/shortlist');

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        My Shortlist
      </h1>

      {shortlist.length === 0 ? (
        <p>No jobs in your shortlist.</p>
      ) : (
        <ul className="space-y-4">
          {shortlist.map((item) => (
            <li
              key={item.id}
              className="border rounded-lg p-4"
            >
              <h2 className="text-lg font-medium">
                {item.title}
              </h2>

              <p className="text-gray-600">
                {item.company_name}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Shortlisted on{' '}
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

