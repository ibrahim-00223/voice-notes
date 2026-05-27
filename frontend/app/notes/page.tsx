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
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-syne)", color: "#fff" }}
      >
        Notes
      </h1>

      {loading && (
        <div
          className="text-center py-12 text-sm"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          Chargement…
        </div>
      )}

      {error && (
        <div className="border rounded-lg p-4 text-sm text-red-400 bg-red-950/30 border-red-900/50">
          {error}
        </div>
      )}

      {!loading && !error && notes.length === 0 && (
        <div
          className="text-center py-12 text-sm border border-dashed rounded-lg"
          style={{
            color: "rgba(255,255,255,0.28)",
            borderColor: "rgba(255,255,255,0.08)",
            background: "#111111",
          }}
        >
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
