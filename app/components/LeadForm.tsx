'use client';
import { useState } from 'react';

export default function LeadForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form as any)),
    });
    setStatus(res.ok ? 'Thanks — check your email.' : 'Something went wrong. Please try again.');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-md">
      <input name="name" placeholder="Name" className="border p-2 w-full rounded" />
      <input name="email" placeholder="Email" className="border p-2 w-full rounded" required />
      <input name="company" placeholder="Company (optional)" className="border p-2 w-full rounded" />
      <textarea name="message" placeholder="What do you need?" className="border p-2 w-full rounded" />
      {/* honeypot */}
      <input type="text" name="hp_field" className="hidden" tabIndex={-1} autoComplete="off" />
      <button className="border px-4 py-2 rounded">Send</button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  );
}
