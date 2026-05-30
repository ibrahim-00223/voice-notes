const API_URL = "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VoiceRecord {
  id: number;
  title: string | null;
  datetime: string;
  duration: number | null;
  audio_file: string | null;
  transcript: string | null;
}

export interface Note {
  id: number;
  title: string | null;
  datetime: string;
  text: string | null;
  voice_record_id: number;
}

export interface Post {
  id: number;
  title: string | null;
  content: string | null;
  datetime: string;
  scheduled_at: string | null;
  published_at: string | null;
  note_id: number;
  platform_id: number;
  status_id: number;
}

export interface Tag {
  id: number;
  name: string;
}

export type Platform = "linkedin" | "twitter";
export type PostWithPlatform = Post & { platform_name: Platform };

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  voiceRecords: {
    list: () => apiFetch<VoiceRecord[]>("/api/voice-records"),
    get: (id: number) => apiFetch<VoiceRecord>(`/api/voice-records/${id}`),
    getAudioUrl: (id: number) =>
      apiFetch<{ url: string }>(`/api/voice-records/${id}/audio-url`),
    upload: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetch<VoiceRecord>("/api/voice-records", {
        method: "POST",
        body: form,
      });
    },
    delete: (id: number) =>
      apiFetch<{ deleted: boolean; id: number }>(`/api/voice-records/${id}`, {
        method: "DELETE",
      }),
  },

  notes: {
    list: () => apiFetch<Note[]>("/api/notes"),
    get: (id: number) => apiFetch<Note>(`/api/notes/${id}`),
    generate: (voice_record_id: number, provider = "openrouter", model?: string) => {
      const p = new URLSearchParams({
        voice_record_id: String(voice_record_id),
        provider,
      });
      if (model) p.append("model", model);
      return apiFetch<Note>(`/api/notes/generate?${p}`, { method: "POST" });
    },
    update: (id: number, data: { title?: string; text?: string }) =>
      apiFetch<Note>(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<{ deleted: boolean; id: number }>(`/api/notes/${id}`, {
        method: "DELETE",
      }),
  },

  posts: {
    list: (platform?: Platform) => {
      const qs = platform ? `?platform=${platform}` : "";
      return apiFetch<Post[]>(`/api/posts${qs}`);
    },
    get: (id: number) => apiFetch<Post>(`/api/posts/${id}`),
    generate: (
      note_id: number,
      platform: Platform,
      provider = "anthropic",
      model?: string
    ) => {
      const p = new URLSearchParams({
        note_id: String(note_id),
        platform,
        provider,
      });
      if (model) p.append("model", model);
      return apiFetch<Post>(`/api/posts/generate?${p}`, { method: "POST" });
    },
    sendToNocodb: (id: number) =>
      apiFetch<{ sent: boolean; nocodb_id: string; post_id: number }>(
        `/api/posts/${id}/send-to-nocodb`,
        { method: "POST" }
      ),
    update: (id: number, data: { title?: string; content?: string }) =>
      apiFetch<Post>(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch<{ deleted: boolean; id: number }>(`/api/posts/${id}`, {
        method: "DELETE",
      }),
  },

  tags: {
    list: () => apiFetch<Tag[]>("/api/tags"),
  },
};

// ─── Utils ────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string, withTime = false): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
