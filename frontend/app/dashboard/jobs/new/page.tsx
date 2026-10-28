// frontend/app/dashboard/jobs/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const submitter = (e.nativeEvent as SubmitEvent)
    .submitter as HTMLButtonElement | null;

   const status = submitter?.value === 'open' ? 'open' : 'draft';
    const body = {
      title: form.get('title') as string,
      description: form.get('description') as string,
      location: form.get('location') as string,
      employment_type: form.get('employment_type') as string,
      status
    };

    // Client component calls a Next.js API route (not the backend directly)
    // to keep the token in httpOnly cookies
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    

    if (res.ok) {
      const { jobId } = await res.json();
      router.push(`/dashboard/jobs/${jobId}`);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong.');
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Post a job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input name="title" required className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={5} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input name="location" className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Employment type</label>
          <select name="employment_type" className="w-full border rounded px-3 py-2 text-sm">
            <option value="">— select —</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          value="draft"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 flex-col flex flex-wrap"
        >
          {loading ? 'Saving…' : 'Save as draft'}
        </button>
        <button
          type="submit"
          value="open"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 flex flex-col flex-wrap"
        >
          {loading ? 'Saving…' : 'Save as open'}
        </button>
      </form>
    </div>
  );
}