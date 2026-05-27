"use client";

import { useState } from "react";
import { PostWithPlatform, formatDate } from "@/lib/api";

const PLATFORM = {
  linkedin: {
    label: "LinkedIn",
    badge: { background: "rgba(59,130,246,0.12)", color: "#93c5fd" },
    border: "rgba(59,130,246,0.2)",
    btn: { background: "#2563eb", hover: "#1d4ed8" },
  },
  twitter: {
    label: "X / Twitter",
    badge: { background: "rgba(14,165,233,0.12)", color: "#7dd3fc" },
    border: "rgba(14,165,233,0.2)",
    btn: { background: "#0ea5e9", hover: "#0284c7" },
  },
} as const;

interface Props {
  post: PostWithPlatform;
  onSendToNocodb?: (id: number) => Promise<void>;
  onDelete?: (id: number) => void;
}

export default function PostCard({ post, onSendToNocodb, onDelete }: Props) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const cfg = PLATFORM[post.platform_name];

  const handleSend = async () => {
    if (!onSendToNocodb) return;
    setSending(true);
    try {
      await onSendToNocodb(post.id);
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="rounded-xl p-5 border transition-all"
      style={{
        background: "#111111",
        borderColor: cfg.border,
        boxShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={cfg.badge}
        >
          {cfg.label}
        </span>
        <span
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-jetbrains)" }}
        >
          {formatDate(post.datetime)}
        </span>
      </div>

      {/* Title */}
      {post.title && (
        <p className="font-semibold mb-2" style={{ color: "#fff" }}>
          {post.title}
        </p>
      )}

      {/* Content */}
      <p
        className="text-sm whitespace-pre-wrap leading-relaxed"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        {post.content || "—"}
      </p>

      {/* Actions */}
      <div
        className="flex items-center gap-2 mt-4 pt-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {onSendToNocodb && (
          <button
            onClick={handleSend}
            disabled={sending || sent}
            className="text-sm text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60"
            style={{ background: cfg.btn.background }}
            onMouseOver={(e) => {
              if (!sending && !sent)
                (e.currentTarget as HTMLElement).style.background = cfg.btn.hover;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = cfg.btn.background;
            }}
          >
            {sent ? "✓ Envoyé" : sending ? "Envoi…" : "Envoyer vers NocoDB"}
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="ml-auto p-1 transition-colors"
            style={{ color: "rgba(255,255,255,0.28)" }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)")}
            title="Supprimer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
