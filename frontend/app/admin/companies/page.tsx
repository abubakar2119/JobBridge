import { cookies } from 'next/headers';
import { verifyCompany, suspendCompany, pendingCompany } from './actions';

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
      <h1 className="mx-auto mt-6 mb-4 w-fit rounded-2xl bg-blue-600
       px-6 py-3 text-2xl font-bold text-white">Companies</h1>

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <a href="/admin/companies" 
        className="rounded-lg bg-slate-800 px-5 py-2 font-semibold text-white transition hover:bg-slate-700"
        >All</a>{' '}
        <a href="/admin/companies?status=pending"
        className="rounded-lg bg-white px-5 py-2 font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-blue-50"
        >Pending</a>{' '}
        <a href="/admin/companies?status=verified"
        className="rounded-lg bg-white px-5 py-2 font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-blue-50">Verified</a>{' '}
        <a href="/admin/companies?status=suspended"
        className="rounded-lg bg-slate-800 px-5 py-2 font-semibold text-white transition hover:bg-slate-700"
        >Suspended</a>
        
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-100 text-sm uppercase text-slate-600">
          <tr>
            <th className="px-5 py-4">Name</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Owner</th>
            <th className="px-5 py-4">Created</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {companies.map((c) => (
            <tr key={c.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold text-slate-800">{c.name}</td>
              <td className="px-5 py-4 text-slate-600">{c.status}</td>
              <td className="px-5 py-4">{c.owner_email}</td>
              <td className="px-5 py-4 text-slate-600">{new Date(c.created_at).toLocaleDateString()}</td>

              <td className="px-5 py-4">
                <div className="flex min-w-28 flex-col gap-3">
                <form action={verifyCompany}>
                  <input
                    type="hidden"
                    name="id"
                    value={c.id}
                  />
                  <button
                    type="submit"
                    disabled={c.status === 'verified'}
                    className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold
                     text-white shadow-sm transition duration-200  hover:bg-green-700 hover:shadow-md 
                     active:scale-95 disabled:cursor-not-allowed
                     disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                   
                  >
                    Verify
                  </button>
                </form>
                <form action={pendingCompany}>
                  <input
                    type="hidden"
                    name="id"
                    value={c.id}
                  />
                  <button
                    type="submit"
                    disabled={c.status === 'pending'}
                    className="w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold
                    text-white shadow-sm transition duration-200 hover:bg-amber-600 hover:shadow-md active:scale-95 
                    disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                  >
                    pending
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
                    className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm 
                    font-semibold text-white shadow-sm transition duration-200 hover:bg-red-700
                    hover:shadow-md active:scale-95 disabled:cursor-not-allowed
                     disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"                  >
                    Suspend
                  </button>
                </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}