// utils/api.ts
export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/ai/resume-process', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Resume upload failed: ${errorText}`);
  }

  return res.json();
}
