"use client";

import Link from "next/link";
import { VoiceRecord, formatDate, formatDuration } from "@/lib/api";

interface Props {
  record: VoiceRecord;
  onDelete?: (id: number) => void;
}

export default function VoiceRecordCard({ record, onDelete }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5 text-violet-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
        </svg>
      </div>

      {/* Content */}
      <Link href={`/records/${record.id}`} className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate hover:text-violet-600 transition-colors">
          {record.title || "Enregistrement sans titre"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDate(record.datetime, true)}
        </p>
      </Link>

      {/* Duration badge */}
      <span className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium shrink-0">
        {formatDuration(record.duration)}
      </span>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(record.id);
          }}
          className="text-gray-300 hover:text-red-500 transition-colors p-1 shrink-0"
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
  );
}
