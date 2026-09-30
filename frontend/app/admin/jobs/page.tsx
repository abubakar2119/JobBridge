import { cookies } from 'next/headers';
import { closeJob } from './actions';

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
    <section>
      <h1>Jobs</h1>
      <div>
        <a href="/admin/jobs">All</a>
        <a href="/admin/jobs?status=open">Open</a>
        <a href="/admin/jobs?status=closed">Closed</a>
      </div>
      <table>
        <thead>
          <tr><th>Title</th><th>Company</th><th>Status</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id}>
              <td>{j.title}</td>
              <td>{j.company_name}</td>
              <td>{j.status}</td>
              <td>{new Date(j.created_at).toLocaleDateString()}</td>
              <td>
                <form action={closeJob}>
                  <input type="hidden" name="id" value={j.id} />
                  <button type="submit" disabled={j.status === 'closed'}>Close</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}