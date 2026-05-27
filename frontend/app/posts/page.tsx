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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Posts</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(["linkedin", "twitter"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {t === "linkedin" ? "LinkedIn" : "Twitter / X"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Chargement…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg bg-white">
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
