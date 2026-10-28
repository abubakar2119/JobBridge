import { cookies } from 'next/headers';
import { suspendUser, activateUser } from './actions';

async function fetchUsers() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  const data = await res.json();

  return data.users as Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
  }>;
}

export default async function UsersPage() {
  const users = await fetchUsers();

  return (
    <section>
      <h1 className="mx-auto mt-6 mb-4 w-fit rounded-2xl bg-blue-600
       px-6 py-3 text-2xl font-bold text-white">Users</h1>

      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-100 text-sm uppercase text-slate-600">
          <tr>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Role</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Created</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {users.map((user) => (
            <tr key={user.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold text-slate-800">{user.email}</td>
              <td className="px-5 py-4 text-slate-600">{user.role}</td>
              <td className="px-5 py-4">{user.status}</td>
              <td className="px-5 py-4 text-slate-600">{new Date(user.created_at).toLocaleDateString()}</td>

              <td className="px-5 py-4">
                <form action={suspendUser}>
                  <input
                    type="hidden"
                    name="id"
                    value={user.id}
                  />
                  <button
                    type="submit"
                    disabled={user.status === 'suspended'}
                    className="rounded-lg bg-emerald-600 px-4 py-2
                    text-sm font-semibold text-white shadow-sm
                    transition duration-200 hover:bg-emerald-700
                    focus:outline-none focus:ring-2 focus:ring-emerald-500
                    focus:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suspend
                  </button>
                </form>

                <form action={activateUser}>
                  <input
                    type="hidden"
                    name="id"
                    value={user.id}
                  />
                  <button
                    type="submit"
                    disabled={user.status === 'active'}
                     className="rounded-lg bg-blue-950 px-4 py-2
                     text-sm font-semibold text-white shadow-sm
                      transition duration-200 hover:bg-red-800
                      focus:outline-none focus:ring-2 focus:ring-red-800
                      focus:ring-offset-2
                      disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Activate
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