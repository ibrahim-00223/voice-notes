"use client";

import { useEffect, useState } from "react";
import { api, VoiceRecord } from "@/lib/api";
import AudioRecorder from "@/components/AudioRecorder";
import VoiceRecordCard from "@/components/VoiceRecordCard";
import LLMSelector, { LLMConfig } from "@/components/LLMSelector";

type AutoStep = "note" | "linkedin" | "twitter" | "done" | "error";

interface AutoState {
  step: AutoStep;
  error?: string;
}

export default function HomePage() {
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [llm, setLlm] = useState<LLMConfig>({ provider: "openrouter", model: "" });
  const [autoState, setAutoState] = useState<AutoState | null>(null);

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

  const handleSuccess = async (record: VoiceRecord) => {
    setRecords((prev) => [record, ...prev]);

    if (mode === "manual") return;

    const provider = llm.provider;
    const model = llm.model || undefined;

    try {
      setAutoState({ step: "note" });
      const note = await api.notes.generate(record.id, provider, model);

      setAutoState({ step: "linkedin" });
      await api.posts.generate(note.id, "linkedin", provider, model);

      setAutoState({ step: "twitter" });
      await api.posts.generate(note.id, "twitter", provider, model);

      setAutoState({ step: "done" });
      setTimeout(() => setAutoState(null), 3000);
    } catch (e) {
      setAutoState({
        step: "error",
        error: e instanceof Error ? e.message : "Erreur génération auto",
      });
    }
  };

  const stepLabel: Record<AutoStep, string> = {
    note: "Génération de la note…",
    linkedin: "Génération du post LinkedIn…",
    twitter: "Génération du post Twitter/X…",
    done: "✓ Tout généré !",
    error: "Erreur",
  };

  return (
    <div className="space-y-8">
      {/* Recorder section */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-syne)", color: "#fff" }}
          >
            Nouvel enregistrement
          </h1>

          {/* Mode toggle */}
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {(["manual", "auto"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: mode === m ? "#E6004C" : "#1a1a1a",
                  color: mode === m ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              >
                {m === "manual" ? "Manuel" : "Automatique"}
              </button>
            ))}
          </div>
        </div>

        {/* LLM config (always visible, required for auto) */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-jetbrains)", letterSpacing: "0.12em" }}
          >
            Modèle IA
          </span>
          <LLMSelector value={llm} onChange={setLlm} />
        </div>

        <AudioRecorder onSuccess={handleSuccess} />

        {/* Auto progress */}
        {autoState && (
          <div
            className="mt-3 rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2"
            style={{
              background:
                autoState.step === "error"
                  ? "rgba(239,68,68,0.1)"
                  : autoState.step === "done"
                  ? "rgba(74,222,128,0.1)"
                  : "rgba(230,0,76,0.08)",
              border: `1px solid ${
                autoState.step === "error"
                  ? "rgba(239,68,68,0.3)"
                  : autoState.step === "done"
                  ? "rgba(74,222,128,0.3)"
                  : "rgba(230,0,76,0.2)"
              }`,
              color:
                autoState.step === "error"
                  ? "#f87171"
                  : autoState.step === "done"
                  ? "#4ade80"
                  : "rgba(255,255,255,0.8)",
            }}
          >
            {autoState.step !== "done" && autoState.step !== "error" && (
              <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {autoState.step === "error"
              ? autoState.error
              : stepLabel[autoState.step]}
          </div>
        )}
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
