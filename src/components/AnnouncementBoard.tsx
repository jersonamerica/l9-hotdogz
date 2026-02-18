"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

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

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

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
        const res = await fetch(`/api/announcements/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, pinned }),
        });
        if (res.ok) {
          resetForm();
          fetchAnnouncements();
        }
      } else {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, pinned }),
        });
        if (res.ok) {
          resetForm();
          fetchAnnouncements();
        }
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
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAnnouncements();
      }
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-game-accent"></div>
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
              {/* Avatar */}
              <div className="flex-shrink-0 mt-0.5">
                {ann.createdBy?.image ? (
                  <img
                    src={ann.createdBy.image}
                    alt={ann.createdBy.name}
                    className="w-7 h-7 rounded-full border border-game-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-game-darker border border-game-border flex items-center justify-center text-xs text-game-text-muted">
                    {ann.createdBy?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

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
