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
    
  <nav className="flex flex-wrap items-center p-6 justify-center ">
  
      <a href="/admin/companies" className='bg-amber-700 p-3 m-2 mr-2.5
      rounded-2xl cursor-pointer font-bold text-white'>Click here to get companies</a>
  
      <a href="/admin/jobs" className='bg-blue-400 p-3 m-2 
      rounded-2xl cursor-pointer font-bold text-white'>click here to get jobs</a>
  
      <a href="/admin/users" className='bg-black p-3 m-2 
      rounded-2xl cursor-pointer font-bold text-white'> Click here to get users</a>
    </nav>

    <main>{children}</main>
  </>
);
}