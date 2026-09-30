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
      <h1>Users</h1>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>

              <td>
                <form action={suspendUser}>
                  <input
                    type="hidden"
                    name="id"
                    value={user.id}
                  />
                  <button
                    type="submit"
                    disabled={user.status === 'suspended'}
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