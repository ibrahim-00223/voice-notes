"use client";

import Link from "next/link";
import { Note, formatDate } from "@/lib/api";

interface Props {
  note: Note;
  onDelete?: (id: number) => void;
}

export default function NoteCard({ note, onDelete }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Content */}
        <Link href={`/notes/${note.id}`} className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 hover:text-violet-600 transition-colors">
            {note.title || "Note sans titre"}
          </p>
          {note.text && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {note.text}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">{formatDate(note.datetime)}</p>
        </Link>

        {/* Delete */}
        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="text-gray-300 hover:text-red-500 transition-colors p-1 shrink-0 mt-0.5"
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
