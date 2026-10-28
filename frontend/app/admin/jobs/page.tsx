import { cookies } from 'next/headers';
import { closeJob} from './actions';

async function fetchJobs(status?: string) {
  const cookieStore = await cookies();
const token = cookieStore.get('access_token')?.value ?? '';
  const qs = status ? `?status=${status}` : '';
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/jobs${qs}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );
  const data = await res.json();
  return data.jobs as Array<{
    id: string; title: string; status: string; company_name: string; created_at: string;
  }>;
}

export default async function JobsPage({ searchParams }: { searchParams: { status?: string } }) {
  const jobs = await fetchJobs(searchParams.status);

  return (
    <section >
      <h1 className="mx-auto mt-6 mb-4 w-fit rounded-2xl bg-blue-600 px-6 py-3 text-2xl font-bold text-white">
          Jobs
      </h1>
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <a href="/admin/jobs" 
        className="rounded-lg bg-slate-800 px-5 py-2 font-semibold text-white transition hover:bg-slate-700">All</a>
        <a href="/admin/jobs?status=open" 
        className="rounded-lg bg-white px-5 py-2 font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-blue-50">Open</a>
        <a href="/admin/jobs?status=closed" 
        className="rounded-lg bg-white px-5 py-2 font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-blue-50">Closed</a>
      </div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
  <table className="w-full border-collapse text-left">
    <thead className="bg-slate-100 text-sm uppercase text-slate-600">
      <tr>
        <th className="px-5 py-4">Title</th>
        <th className="px-5 py-4">Company</th>
        <th className="px-5 py-4">Status</th>
        <th className="px-5 py-4">Created</th>
        <th className="px-5 py-4">Actions</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-slate-200">
      {jobs.map((j) => (
        <tr key={j.id} className="transition hover:bg-slate-50">
          <td className="px-5 py-4 font-semibold text-slate-800">
            {j.title}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {j.company_name}
          </td>

          <td className="px-5 py-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                j.status === "open"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {j.status}
            </span>
          </td>

          <td className="px-5 py-4 text-slate-600">
            {new Date(j.created_at).toLocaleDateString()}
          </td>

          <td className="px-5 py-4">
            <form action={closeJob}>
              <input type="hidden" name="id" value={j.id} />

              <button
                type="submit"
                disabled={j.status === "closed"}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Close
              </button>
            </form>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </section>
  );
}