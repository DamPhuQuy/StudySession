import type { Session } from '../types';

const API = '/api/sessions';

export async function uploadFile(file: File): Promise<Session> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(API, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function getSession(id: string): Promise<Session> {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

export async function listSessions(): Promise<Session[]> {
  const res = await fetch(API);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}
