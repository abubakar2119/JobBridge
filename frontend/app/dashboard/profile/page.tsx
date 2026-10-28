// app/dashboard/profile/page.tsx (simplified Client Component for upload)
'use client';
import { useState } from 'react';

export default function ProfilePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: get presigned URL
      const { uploadUrl, key } = await fetch('/api/applicants/profile/resume-upload', {
        method: 'POST',
      }).then((r) => r.json());

      // Step 2: PUT directly to S3/MinIO
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
      });

      // Step 3: confirm
      await fetch('/api/applicants/profile/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, filename: file.name }),
      });

      setMessage('Résumé uploaded successfully');
    } catch {
      setMessage('Upload failed — please try again');
    } finally {
      setUploading(false);
    }
  }


return (
  <main className="mx-auto mt-10 max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
    <h1 className="mb-6 rounded-xl bg-blue-600 px-6 py-4 text-center text-2xl font-bold text-white shadow">
      My Profile
    </h1>

    <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-6">
      <label className="mb-3 block text-sm font-semibold text-gray-700">
        Upload Your Resume (PDF)
      </label>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleResumeUpload}
        disabled={uploading}
        className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700
        file:mr-4 file:rounded-md file:border-0 file:bg-blue-600
        file:px-4 file:py-2 file:font-semibold file:text-white
        hover:file:bg-blue-700
        disabled:cursor-not-allowed disabled:opacity-50"
      />

      <p className="mt-3 text-xs text-gray-500">
        Please select your resume in PDF format.
      </p>
    </div>

    {uploading && (
      <p className="mt-4 animate-pulse text-center text-sm font-medium text-blue-600">
        Uploading your resume...
      </p>
    )}

    {message && (
      <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
        {message}
      </p>
    )}
  </main>
);
}