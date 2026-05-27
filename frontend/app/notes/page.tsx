"use client";

import { useEffect, useState } from "react";
import { api, Note } from "@/lib/api";
import NoteCard from "@/components/NoteCard";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.notes
      .list()
      .then(setNotes)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette note ?")) return;
    await api.notes.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notes</h1>

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Chargement…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && notes.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg bg-white">
          Aucune note pour l&apos;instant. Générez-en depuis un enregistrement.
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
