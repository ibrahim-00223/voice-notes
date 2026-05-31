"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Note, PostWithPlatform, Platform, formatDate } from "@/lib/api";
import PostCard from "@/components/PostCard";
import LLMSelector, { LLMConfig } from "@/components/LLMSelector";

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [note, setNote] = useState<Note | null>(null);
  const [posts, setPosts] = useState<PostWithPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<{ platform: Platform; bulletIndex: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [llm, setLlm] = useState<LLMConfig>({ provider: "openrouter", model: "" });
  const [savedOk, setSavedOk] = useState(false);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [n, linkedinData, twitterData] = await Promise.all([
          api.notes.get(id),
          api.posts.list("linkedin"),
          api.posts.list("twitter"),
        ]);
        setNote(n);
        setTitle(n.title || "");
        setText(n.text || "");

        const tagged: PostWithPlatform[] = [
          ...linkedinData
            .filter((p) => p.note_id === id)
            .map((p) => ({ ...p, platform_name: "linkedin" as Platform })),
          ...twitterData
            .filter((p) => p.note_id === id)
            .map((p) => ({ ...p, platform_name: "twitter" as Platform })),
        ].sort(
          (a, b) =>
            new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
        );
        setPosts(tagged);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSavedOk(false);
    try {
      const updated = await api.notes.update(id, { title, text });
      setNote(updated);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async (platform: Platform, bulletIndex?: number) => {
    setGenerating({ platform, bulletIndex: bulletIndex ?? null });
    setError(null);
    try {
      const post = await api.posts.generate(id, platform, llm.provider, llm.model || undefined, bulletIndex);
      setPosts((prev) => [{ ...post, platform_name: platform }, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur génération");
    } finally {
      setGenerating(null);
    }
  };

  const bullets = text
    ? text.split("\n\n").map((b) => b.trim()).filter((b) => b.length > 0)
    : [];

  const handleSendToNocodb = async (postId: number) => {
    await api.posts.sendToNocodb(postId);
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Supprimer ce post ?")) return;
    await api.posts.delete(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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

  if (!note)
    return (
      <div
        className="text-center py-16 text-sm"
        style={{ color: "rgba(255,255,255,0.28)" }}
      >
        Note introuvable.
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href={`/records/${note.voice_record_id}`}
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: "rgba(255,255,255,0.55)" }}
        onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
        onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)")}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à l&apos;enregistrement
      </Link>

      {/* Note editor */}
      <div
        className="rounded-xl p-6 space-y-5 border"
        style={{
          background: "#111111",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-syne)", color: "#fff" }}
            >
              Note
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
              {formatDate(note.datetime, true)}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            style={{ background: "#E6004C" }}
            onMouseOver={(e) => {
              if (!saving) (e.currentTarget as HTMLElement).style.background = "#cc003d";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#E6004C";
            }}
          >
            {saving ? "Sauvegarde…" : savedOk ? "✓ Sauvegardé" : "Sauvegarder"}
          </button>
        </div>

        {error && (
          <div className="border rounded-lg p-3 text-sm text-red-400 bg-red-950/30 border-red-900/50">
            {error}
          </div>
        )}

        {/* Title input */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "var(--font-jetbrains)",
              letterSpacing: "0.12em",
            }}
          >
            Titre
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(230,0,76,0.5)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(230,0,76,0.12)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
            placeholder="Titre de la note"
          />
        </div>

        {/* Bullets */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "var(--font-jetbrains)",
              letterSpacing: "0.12em",
            }}
          >
            Sujets
          </label>
          {bullets.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.28)" }}>
              Aucun sujet détecté.
            </p>
          ) : (
            <div className="space-y-3">
              {bullets.map((bullet, i) => {
                const isGeneratingLinkedin = generating?.platform === "linkedin" && generating?.bulletIndex === i;
                const isGeneratingTwitter = generating?.platform === "twitter" && generating?.bulletIndex === i;
                const isGenerating = isGeneratingLinkedin || isGeneratingTwitter;
                return (
                  <div
                    key={i}
                    className="rounded-lg p-4 border"
                    style={{
                      background: "#1a1a1a",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                      {bullet}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerate("linkedin", i)}
                        disabled={generating !== null}
                        className="flex items-center gap-1.5 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ background: "#2563eb" }}
                        onMouseOver={(e) => {
                          if (!generating) (e.currentTarget as HTMLElement).style.background = "#1d4ed8";
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "#2563eb";
                        }}
                      >
                        {isGeneratingLinkedin ? (
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : "✨"} LinkedIn
                      </button>
                      <button
                        onClick={() => handleGenerate("twitter", i)}
                        disabled={generating !== null}
                        className="flex items-center gap-1.5 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ background: "#0ea5e9" }}
                        onMouseOver={(e) => {
                          if (!generating) (e.currentTarget as HTMLElement).style.background = "#0284c7";
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "#0ea5e9";
                        }}
                      >
                        {isGeneratingTwitter ? (
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : "✨"} Twitter/X
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Generate posts */}
      <section>
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold" style={{ color: "#fff" }}>
            Posts générés
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              ({posts.length})
            </span>
          </h2>
          <LLMSelector value={llm} onChange={setLlm} />
        </div>

        {posts.length === 0 ? (
          <div
            className="text-center py-10 text-sm border border-dashed rounded-lg"
            style={{
              color: "rgba(255,255,255,0.28)",
              borderColor: "rgba(255,255,255,0.08)",
              background: "#111111",
            }}
          >
            Aucun post. Générez un post LinkedIn ou Twitter ci-dessus.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSendToNocodb={handleSendToNocodb}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
