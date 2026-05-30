"use client";

import { useState } from "react";
import Link from "next/link";
import { api, VoiceRecord, formatDate, formatDuration } from "@/lib/api";

interface Props {
  record: VoiceRecord;
  onDelete?: (id: number) => void;
}

export default function VoiceRecordCard({ record, onDelete }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!record.audio_file) return;

    if (showPlayer) {
      setShowPlayer(false);
      return;
    }

    if (audioUrl) {
      setShowPlayer(true);
      return;
    }

    setLoadingAudio(true);
    try {
      const data = await api.voiceRecords.getAudioUrl(record.id);
      setAudioUrl(data.url);
      setShowPlayer(true);
    } catch {
      alert("Impossible de charger l'audio");
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!record.audio_file) return;

    let url = audioUrl;
    if (!url) {
      try {
        const data = await api.voiceRecords.getAudioUrl(record.id);
        url = data.url;
        setAudioUrl(url);
      } catch {
        alert("Impossible de télécharger l'audio");
        return;
      }
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.title || "enregistrement"}.webm`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div
      className="rounded-lg border transition-all"
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
      <div className="p-4 flex items-center gap-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(230,0,76,0.08)" }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: "#E6004C" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
          </svg>
        </div>

        {/* Content */}
        <Link href={`/records/${record.id}`} className="flex-1 min-w-0 group">
          <p
            className="font-medium truncate transition-colors"
            style={{ color: "#fff" }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#E6004C")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          >
            {record.title || "Enregistrement sans titre"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
            {formatDate(record.datetime, true)}
          </p>
        </Link>

        {/* Duration badge */}
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
          style={{
            background: "rgba(230,0,76,0.08)",
            color: "#ff4d8d",
            fontFamily: "var(--font-jetbrains)",
          }}
        >
          {formatDuration(record.duration)}
        </span>

        {/* Audio actions */}
        {record.audio_file && (
          <>
            {/* Play/Pause */}
            <button
              onClick={handlePlay}
              disabled={loadingAudio}
              className="p-1.5 rounded-md shrink-0 transition-colors disabled:opacity-40"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#E6004C")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
              title={showPlayer ? "Masquer le player" : "Écouter"}
            >
              {loadingAudio ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : showPlayer ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-md shrink-0 transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#4ade80")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
              title="Télécharger"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </>
        )}

        {/* Delete */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(record.id);
            }}
            className="p-1.5 shrink-0 transition-colors"
            style={{ color: "rgba(255,255,255,0.28)" }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)")}
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Inline audio player */}
      {showPlayer && audioUrl && (
        <div
          className="px-4 pb-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          onClick={(e) => e.preventDefault()}
        >
          <audio
            controls
            src={audioUrl}
            className="w-full mt-3"
            style={{ height: "36px", accentColor: "#E6004C" }}
          />
        </div>
      )}
    </div>
  );
}
