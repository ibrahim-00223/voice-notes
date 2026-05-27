"use client";

import { useEffect, useState } from "react";
import { api, Post, PostWithPlatform, Platform } from "@/lib/api";
import PostCard from "@/components/PostCard";

type Tab = "linkedin" | "twitter";

export default function PostsPage() {
  const [tab, setTab] = useState<Tab>("linkedin");
  const [posts, setPosts] = useState<PostWithPlatform[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async (platform: Platform) => {
    setLoading(true);
    setError(null);
    try {
      const data: Post[] = await api.posts.list(platform);
      setPosts(
        data.map((p) => ({ ...p, platform_name: platform }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(tab);
  }, [tab]);

  const handleSendToNocodb = async (postId: number) => {
    await api.posts.sendToNocodb(postId);
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Supprimer ce post ?")) return;
    await api.posts.delete(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-syne)", color: "#fff" }}
      >
        Posts
      </h1>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 rounded-lg p-1 w-fit"
        style={{ background: "#1a1a1a" }}
      >
        {(["linkedin", "twitter"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={
              tab === t
                ? {
                    background: "#111111",
                    color: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }
                : { color: "rgba(255,255,255,0.55)", background: "transparent" }
            }
          >
            {t === "linkedin" ? "LinkedIn" : "Twitter / X"}
          </button>
        ))}
      </div>

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

      {!loading && !error && posts.length === 0 && (
        <div
          className="text-center py-12 text-sm border border-dashed rounded-lg"
          style={{
            color: "rgba(255,255,255,0.28)",
            borderColor: "rgba(255,255,255,0.08)",
            background: "#111111",
          }}
        >
          Aucun post {tab === "linkedin" ? "LinkedIn" : "Twitter"} pour l&apos;instant.
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSendToNocodb={handleSendToNocodb}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
