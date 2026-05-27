"use client";

import { useState } from "react";
import { PostWithPlatform, formatDate } from "@/lib/api";

const PLATFORM = {
  linkedin: {
    label: "LinkedIn",
    badge: "bg-blue-50 text-blue-700",
    border: "border-blue-100",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  twitter: {
    label: "X / Twitter",
    badge: "bg-sky-50 text-sky-700",
    border: "border-sky-100",
    btn: "bg-sky-500 hover:bg-sky-600",
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
    <div className={`bg-white border rounded-xl p-5 ${cfg.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
        <span className="text-xs text-gray-400">{formatDate(post.datetime)}</span>
      </div>

      {/* Title */}
      {post.title && (
        <p className="font-semibold text-gray-900 mb-2">{post.title}</p>
      )}

      {/* Content */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {post.content || "—"}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        {onSendToNocodb && (
          <button
            onClick={handleSend}
            disabled={sending || sent}
            className={`text-sm text-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-60 ${cfg.btn}`}
          >
            {sent ? "✓ Envoyé" : sending ? "Envoi…" : "Envoyer vers NocoDB"}
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="ml-auto text-gray-300 hover:text-red-500 transition-colors p-1"
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
