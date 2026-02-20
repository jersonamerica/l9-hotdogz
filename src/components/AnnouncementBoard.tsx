"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/useCrudMutation";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface Announcement {
  _id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdBy: {
    _id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementBoard() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const { data: announcements = [], isLoading: loading } =
    useQuery<Announcement[]>({
      queryKey: ["announcements"],
      queryFn: () => fetcher<Announcement[]>("/api/announcements"),
    });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createAnnouncementMutation = useCrudMutation<
    { title: string; content: string; pinned: boolean },
    Announcement
  >({
    method: "POST",
    url: "/api/announcements",
    invalidateKeys: [["announcements"], ["activity"]],
  });

  const updateAnnouncementMutation = useCrudMutation<
    { id: string; title: string; content: string; pinned: boolean },
    Announcement
  >({
    method: "PUT",
    url: (input) => `/api/announcements/${input.id}`,
    invalidateKeys: [["announcements"], ["activity"]],
  });

  const deleteAnnouncementMutation = useCrudMutation<{ id: string }, unknown>({
    method: "DELETE",
    url: (input) => `/api/announcements/${input.id}`,
    invalidateKeys: [["announcements"], ["activity"]],
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPinned(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ann: Announcement) => {
    setTitle(ann.title);
    setContent(ann.content);
    setPinned(ann.pinned);
    setEditingId(ann._id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateAnnouncementMutation.mutateAsync({
          id: editingId,
          title,
          content,
          pinned,
        });
        resetForm();
      } else {
        await createAnnouncementMutation.mutateAsync({
          title,
          content,
          pinned,
        });
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save announcement:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    try {
      await deleteAnnouncementMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-game-border border-t-game-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-game-text flex items-center gap-2">
          <span>📢</span> Announcements
        </h3>
        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-game-accent hover:bg-game-accent-hover text-white text-sm font-medium px-3 py-1 rounded transition-colors cursor-pointer"
          >
            + New
          </button>
        )}
      </div>

      {/* Create/Edit form (admin only) */}
      {isAdmin && showForm && (
        <div className="bg-game-darker/50 border border-game-border rounded p-4 space-y-3 mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full bg-game-dark border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Announcement content..."
            rows={4}
            className="w-full bg-game-dark border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-game-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="accent-game-accent"
              />
              Pin this announcement
            </label>
            <div className="flex gap-2">
              <button
                onClick={resetForm}
                className="text-sm text-game-text-muted hover:text-game-text px-3 py-1.5 border border-game-border rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !content.trim()}
                className="bg-game-accent hover:bg-game-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <p className="text-sm text-game-text-muted text-center py-6 italic">
          No announcements yet.
        </p>
      ) : (
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`flex items-start gap-3 py-2.5 px-2 rounded hover:bg-game-card-hover/50 transition-colors ${
                ann.pinned ? "border-l-2 border-game-accent" : ""
              }`}
            >
              {/* Avatar removed */}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ann.pinned && (
                    <span className="text-xs" title="Pinned">
                      📌
                    </span>
                  )}
                  <span className="text-base font-semibold text-game-text">
                    {ann.title}
                  </span>
                </div>
                <p className="text-sm text-game-text-muted mt-1 line-clamp-3 whitespace-pre-wrap">
                  {ann.content}
                </p>
                <span className="text-xs text-game-text-muted/60 mt-1 block">
                  {ann.createdBy?.name || "Unknown"} &middot;{" "}
                  {formatDate(ann.createdAt)}
                </span>
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(ann)}
                    className="text-game-text-muted hover:text-game-accent text-xs px-1.5 py-1 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  {deletingId === ann._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(ann._id)}
                        className="text-game-accent hover:text-game-accent-hover text-xs px-1.5 py-1 transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-game-text-muted hover:text-game-text text-xs px-1.5 py-1 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(ann._id)}
                      className="text-game-text-muted hover:text-game-accent text-xs px-1.5 py-1 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
