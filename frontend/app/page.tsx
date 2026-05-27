"use client";

import { useEffect, useState } from "react";
import { api, VoiceRecord } from "@/lib/api";
import AudioRecorder from "@/components/AudioRecorder";
import VoiceRecordCard from "@/components/VoiceRecordCard";

export default function HomePage() {
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.voiceRecords.list();
      setRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet enregistrement ?")) return;
    try {
      await api.voiceRecords.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur suppression");
    }
  };

  return (
    <div className="space-y-8">
      {/* Recorder section */}
      <section>
        <h1
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: "var(--font-syne)", color: "#fff" }}
        >
          Nouvel enregistrement
        </h1>
        <AudioRecorder
          onSuccess={(record) => setRecords((prev) => [record, ...prev])}
        />
      </section>

      {/* List section */}
      <section>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "#fff" }}
        >
          Enregistrements récents
          {!loading && (
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              ({records.length})
            </span>
          )}
        </h2>

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

        {!loading && !error && records.length === 0 && (
          <div
            className="text-center py-12 text-sm border border-dashed rounded-lg"
            style={{
              color: "rgba(255,255,255,0.28)",
              borderColor: "rgba(255,255,255,0.08)",
              background: "#111111",
            }}
          >
            Aucun enregistrement. Commencez ci-dessus !
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="space-y-3">
            {records.map((record) => (
              <VoiceRecordCard
                key={record.id}
                record={record}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
