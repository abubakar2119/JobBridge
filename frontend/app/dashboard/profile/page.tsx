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
    <main>
      <h1>My Profile</h1>
      <input type="file" accept="application/pdf" onChange={handleResumeUpload} disabled={uploading} />
      {message && <p>{message}</p>}
    </main>
  );
}