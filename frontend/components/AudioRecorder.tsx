"use client";

import { useState, useRef, useEffect } from "react";
import { api, VoiceRecord } from "@/lib/api";

type Status = "idle" | "recording" | "processing" | "done" | "error";

interface Props {
  onSuccess?: (record: VoiceRecord) => void;
}

export default function AudioRecorder({ onSuccess }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setElapsed(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setStatus("processing");
        try {
          const ext = mimeType.includes("webm") ? "webm" : "mp4";
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const file = new File(
            [blob],
            `recording-${Date.now()}.${ext}`,
            { type: mimeType }
          );
          const record = await api.voiceRecords.upload(file);
          setStatus("done");
          onSuccess?.(record);
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Erreur upload");
        }
      };

      recorder.start(500);
      setStatus("recording");
      timerRef.current = setInterval(
        () => setElapsed((s) => s + 1),
        1000
      );
    } catch {
      setStatus("error");
      setError("Accès au microphone refusé");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recorderRef.current?.stop();
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
    setElapsed(0);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className="rounded-xl p-8 border"
      style={{
        background: "#111111",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Idle */}
        {status === "idle" && (
          <>
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
              style={{ background: "#E6004C" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "#cc003d")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "#E6004C")}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            </button>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Cliquez pour démarrer l&apos;enregistrement
            </p>
          </>
        )}

        {/* Recording */}
        {status === "recording" && (
          <>
            <div className="relative">
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg z-10 relative"
              >
                <div className="w-7 h-7 bg-white rounded-sm" />
              </button>
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
            </div>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#fff" }}
            >
              {fmt(elapsed)}
            </p>
            <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
              Enregistrement en cours
            </p>
          </>
        )}

        {/* Processing */}
        {status === "processing" && (
          <>
            <div
              className="w-16 h-16 rounded-full border-4 animate-spin"
              style={{
                borderColor: "rgba(230,0,76,0.2)",
                borderTopColor: "#E6004C",
              }}
            />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Transcription en cours…
            </p>
          </>
        )}

        {/* Done */}
        {status === "done" && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,222,128,0.1)" }}
            >
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-green-400 font-medium">
              Enregistrement traité !
            </p>
            <button
              onClick={reset}
              className="text-sm underline underline-offset-2 transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)")}
            >
              Nouvel enregistrement
            </button>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-950 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={reset}
              className="text-sm underline underline-offset-2 transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)")}
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
