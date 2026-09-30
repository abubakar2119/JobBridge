'use client';

import { use, useState } from 'react';
import { applyToJob, shortlistJob } from './action';


export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [status, setStatus] = useState<string | null>(null);

  async function handleApply() {
    const result = await applyToJob(id);

    setStatus(
      result.ok
        ? 'Applied!'
        : result.message ?? 'Error'
    );
  }

  async function handleShortlist() {
    const result = await shortlistJob(id);

    setStatus(
      result.ok
        ? 'Shortlisted!'
        : result.message ?? 'Already shortlisted or error'
    );
  }

  return (
    <main>
      <h1>Job {id}</h1>

      <button onClick={handleApply}>
        Apply
      </button>

      <button onClick={handleShortlist}>
        Shortlist
      </button>

      {status && <p>{status}</p>}
    </main>
  );
}