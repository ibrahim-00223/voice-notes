"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Note, PostWithPlatform, Platform, formatDate } from "@/lib/api";
import PostCard from "@/components/PostCard";

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [note, setNote] = useState<Note | null>(null);
  const [posts, setPosts] = useState<PostWithPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<Platform | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  // Editable fields
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

  const handleGenerate = async (platform: Platform) => {
    setGenerating(platform);
    setError(null);
    try {
      const post = await api.posts.generate(id, platform);
      setPosts((prev) => [{ ...post, platform_name: platform }, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur génération");
    } finally {
      setGenerating(null);
    }
  };

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
      <div className="text-center py-16 text-gray-400 text-sm">
        Chargement…
      </div>
    );

  if (!note)
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Note introuvable.
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href={`/records/${note.voice_record_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à l&apos;enregistrement
      </Link>

      {/* Note editor */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Note</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(note.datetime, true)}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving
              ? "Sauvegarde…"
              : savedOk
              ? "✓ Sauvegardé"
              : "Sauvegarder"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {/* Title input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
            Titre
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Titre de la note"
          />
        </div>

        {/* Text textarea */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
            Contenu
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
            placeholder="Contenu de la note…"
          />
        </div>
      </div>

      {/* Generate posts */}
      <section>
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">
            Posts générés
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({posts.length})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerate("linkedin")}
              disabled={generating !== null}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {generating === "linkedin" ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "✨"
              )}{" "}
              LinkedIn
            </button>
            <button
              onClick={() => handleGenerate("twitter")}
              disabled={generating !== null}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {generating === "twitter" ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "✨"
              )}{" "}
              Twitter/X
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg bg-white">
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
