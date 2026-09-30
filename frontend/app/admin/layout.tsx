import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Verify the user is an admin before rendering any admin page
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin-only`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    redirect('/login');
  }

//   const { user } = await res.json();

//   if (user.role !== 'admin') {
//     redirect('/');
//   }

 return (
  <>
    <nav>
      <a href="/admin/companies">Companies</a>
      <a href="/admin/jobs">Jobs</a>
      <a href="/admin/users">Users</a>
    </nav>

    <main>{children}</main>
  </>
);
}