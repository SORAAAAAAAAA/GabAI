import { UUID } from "crypto";

export async function startSession(userId: UUID, job: string, parsedResume: string) {
    const res = await fetch('/api/session/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Send auth cookies with request
        body: JSON.stringify({
          job_title: job,
          resume: parsedResume,
        }),
      });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Start session failed: ${errorText}`);
    }

    return res.json();
}