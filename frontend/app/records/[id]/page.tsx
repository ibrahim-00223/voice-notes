"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, VoiceRecord, Note, formatDate, formatDuration } from "@/lib/api";
import AudioPlayer from "@/components/AudioPlayer";
import NoteCard from "@/components/NoteCard";
import LLMSelector, { LLMConfig } from "@/components/LLMSelector";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [record, setRecord] = useState<VoiceRecord | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llm, setLlm] = useState<LLMConfig>({ provider: "openrouter", model: "" });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [rec, allNotes] = await Promise.all([
          api.voiceRecords.get(id),
          api.notes.list(),
        ]);
        setRecord(rec);
        setNotes(allNotes.filter((n) => n.voice_record_id === id));

        // Load audio URL if file exists
        if (rec.audio_file) {
          api.voiceRecords.getAudioUrl(id)
            .then((d) => setAudioUrl(d.url))
            .catch(() => null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleGenerateNote = async () => {
    setGenerating(true);
    setError(null);
    try {
      const note = await api.notes.generate(id, llm.provider, llm.model || undefined);
      setNotes((prev) => [note, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Supprimer cette note ?")) return;
    await api.notes.delete(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  if (loading)
    return (
      <div
        className="text-center py-16 text-sm"
        style={{ color: "rgba(255,255,255,0.28)" }}
      >
        Chargement…
      </div>
    );

  if (!record)
    return (
      <div
        className="text-center py-16 text-sm"
        style={{ color: "rgba(255,255,255,0.28)" }}
      >
        Enregistrement introuvable.
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: "rgba(255,255,255,0.55)" }}
        onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
        onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)")}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour aux enregistrements
      </Link>

      {/* Record card */}
      <div
        className="rounded-xl p-6 border"
        style={{
          background: "#111111",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl font-bold leading-snug"
              style={{ fontFamily: "var(--font-syne)", color: "#fff" }}
            >
              {record.title || "Enregistrement sans titre"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>
              {formatDate(record.datetime, true)}
            </p>
          </div>
          {record.duration != null && (
            <span
              className="text-sm px-3 py-1.5 rounded-full font-medium shrink-0"
              style={{
                background: "rgba(230,0,76,0.08)",
                color: "#ff4d8d",
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              {formatDuration(record.duration)}
            </span>
          )}
        </div>

        {/* Transcript */}
        <div
          className="mt-5 p-4 rounded-lg"
          style={{ background: "#1a1a1a" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "var(--font-jetbrains)",
              letterSpacing: "0.12em",
            }}
          >
            Transcription
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {record.title || "—"}
          </p>
        </div>

        {/* Audio player */}
        {record.audio_file && (
          <div className="mt-4">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{
                color: "rgba(255,255,255,0.28)",
                fontFamily: "var(--font-jetbrains)",
                letterSpacing: "0.12em",
              }}
            >
              Audio
            </p>
            <AudioPlayer
              url={audioUrl}
              filename={record.title || "enregistrement"}
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <section>
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold" style={{ color: "#fff" }}>
            Notes
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              ({notes.length})
            </span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <LLMSelector value={llm} onChange={setLlm} />
          <button
            onClick={handleGenerateNote}
            disabled={generating}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            style={{ background: "#E6004C" }}
            onMouseOver={(e) => {
              if (!generating) (e.currentTarget as HTMLElement).style.background = "#cc003d";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#E6004C";
            }}
          >
            {generating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération…
              </>
            ) : (
              <>✨ Générer une note</>
            )}
          </button>
          </div>
        </div>

        {error && (
          <div className="border rounded-lg p-3 text-sm text-red-400 bg-red-950/30 border-red-900/50 mb-4">
            {error}
          </div>
        )}

        {notes.length === 0 ? (
          <div
            className="text-center py-10 text-sm border border-dashed rounded-lg"
            style={{
              color: "rgba(255,255,255,0.28)",
              borderColor: "rgba(255,255,255,0.08)",
              background: "#111111",
            }}
          >
            Aucune note. Cliquez sur &quot;Générer une note&quot; pour créer une synthèse IA.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
