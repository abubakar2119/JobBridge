// // app/dashboard/applications/page.tsx
// import { apiFetch } from '../../lib/api';

// const STAGE_COLOURS: Record<string, string> = {
//   applied:         'bg-gray-200',
//   screening:       'bg-blue-200',
//   interview:       'bg-yellow-200',
//   final_interview: 'bg-orange-200',
//   offer:           'bg-green-200',
//   hired:           'bg-green-500',
//   rejected:        'bg-red-200',
// };

// export default async function ApplicationsPage() {
//   const { applications } = await apiFetch<{ applications: any[] }>('/api/applicants/applications');

//   return (
//     <main>
//       <h1>My Applications</h1>
//       <ul>
//         {applications.map((app) => (
//           <li key={app.id}>
//             <span>{app.job_title} — {app.company_name}</span>
//             <span className={`badge ${STAGE_COLOURS[app.stage] ?? ''}`}>{app.stage}</span>
//             {app.upcoming_interview && (
//               <span>Interview: {new Date(app.upcoming_interview.scheduled_at).toLocaleString()}</span>
//             )}
//           </li>
//         ))}
//       </ul>
//     </main>
//   );
// }

export default function ApplicationsPage() {
  return (
    <main>
      <h1>My Applications</h1>
      <p>Applications will be available in a later chapter.</p>
    </main>
  );
}

