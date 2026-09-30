import { cookies } from 'next/headers';
import { verifyCompany, suspendCompany } from './actions';

async function fetchCompanies(status?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';

  const url = status
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/companies?status=${status}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/companies`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch companies: ${res.status}`);
  }

  const data = await res.json();

  return data.companies as Array<{
    id: string;
    name: string;
    status: string;
    owner_email: string;
    created_at: string;
  }>;
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const companies = await fetchCompanies(params.status);

  return (
    <section>
      <h1>Companies</h1>

      <div>
        <a href="/admin/companies">All</a>{' '}
        <a href="/admin/companies?status=pending">Pending</a>{' '}
        <a href="/admin/companies?status=verified">Verified</a>{' '}
        <a href="/admin/companies?status=suspended">Suspended</a>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.status}</td>
              <td>{c.owner_email}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>

              <td>
                <form action={verifyCompany}>
                  <input
                    type="hidden"
                    name="id"
                    value={c.id}
                  />
                  <button
                    type="submit"
                    disabled={c.status === 'verified'}
                  >
                    Verify
                  </button>
                </form>

                <form action={suspendCompany}>
                  <input
                    type="hidden"
                    name="id"
                    value={c.id}
                  />
                  <button
                    type="submit"
                    disabled={c.status === 'suspended'}
                  >
                    Suspend
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}