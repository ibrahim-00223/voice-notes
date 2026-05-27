"use client";

import Link from "next/link";
import { Note, formatDate } from "@/lib/api";

interface Props {
  note: Note;
  onDelete?: (id: number) => void;
}

export default function NoteCard({ note, onDelete }: Props) {
  return (
    <div
      className="rounded-lg p-4 transition-all border"
      style={{
        background: "#111111",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(230,0,76,0.25)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div className="flex items-start gap-3">
        {/* Content */}
        <Link href={`/notes/${note.id}`} className="flex-1 min-w-0">
          <p
            className="font-medium transition-colors"
            style={{ color: "#fff" }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#E6004C")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          >
            {note.title || "Note sans titre"}
          </p>
          {note.text && (
            <p
              className="text-sm mt-1 line-clamp-2 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {note.text}
            </p>
          )}
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.28)" }}>
            {formatDate(note.datetime)}
          </p>
        </Link>

        {/* Delete */}
        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 shrink-0 mt-0.5 transition-colors"
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
