"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, VoiceRecord, Note, formatDate, formatDuration } from "@/lib/api";
import NoteCard from "@/components/NoteCard";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [record, setRecord] = useState<VoiceRecord | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [rec, allNotes] = await Promise.all([
          api.voiceRecords.get(id),
          api.notes.list(),
        ]);
        setRecord(rec);
        setNotes(allNotes.filter((n) => n.voice_record_id === id));
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
      const note = await api.notes.generate(id);
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
    return <div className="text-center py-16 text-gray-400 text-sm">Chargement…</div>;

  if (!record)
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Enregistrement introuvable.
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour aux enregistrements
      </Link>

      {/* Record card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">
              {record.title || "Enregistrement sans titre"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {formatDate(record.datetime, true)}
            </p>
          </div>
          {record.duration != null && (
            <span className="text-sm bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full font-medium shrink-0">
              {formatDuration(record.duration)}
            </span>
          )}
        </div>

        {/* Transcript */}
        <div className="mt-5 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Transcription
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            {record.title || "—"}
          </p>
        </div>
      </div>

      {/* Notes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Notes
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({notes.length})
            </span>
          </h2>
          <button
            onClick={handleGenerateNote}
            disabled={generating}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg bg-white">
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
