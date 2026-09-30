'use server';

import { apiFetch } from '@/lib/api';

export async function applyToJob(jobId: string) {
  const res = await apiFetch('/api/applicants/apply', {
    method: 'POST',
    body: JSON.stringify({
      jobIds: [jobId],
      answers: {},
    }),
  });

  const data = await res.json().catch(() => ({}));

  console.log('APPLY BACKEND:', res.status, data);

  return {
    ok: res.ok,
    message: data.message ?? data.error?.message,
  };
}

export async function shortlistJob(jobId: string) {
  const res = await apiFetch('/api/applicants/shortlist', {
    method: 'POST',
    body: JSON.stringify({ jobId }),
  });

  const data = await res.json().catch(() => ({}));

  console.log('SHORTLIST BACKEND:', res.status, data);

  return {
    ok: res.ok,
    message: data.message ?? data.error?.message,
  };
}