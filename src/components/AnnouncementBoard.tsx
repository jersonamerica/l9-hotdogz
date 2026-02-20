"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/useCrudMutation";
import { Card, CardHeader, Button, Input, Textarea } from "@/components/ui";

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
      <Card variant="glass">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-game-border border-t-game-accent"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader
        action={
          isAdmin && !showForm ? (
            <Button size="sm" onClick={() => setShowForm(true)}>
              + New
            </Button>
          ) : undefined
        }
      >
        <span className="flex items-center gap-2">
          <span>📢</span> Announcements
        </span>
      </CardHeader>

      {/* Create/Edit form (admin only) */}
      {isAdmin && showForm && (
        <div className="bg-game-darker/50 border border-game-border rounded p-4 space-y-3 mb-4">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Announcement content..."
            rows={4}
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
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !content.trim()}
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Post"}
              </Button>
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(ann)}
                    className="text-xs px-1.5"
                    title="Edit"
                  >
                    ✏️
                  </Button>
                  {deletingId === ann._id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(ann._id)}
                        className="text-xs px-1.5 text-game-accent hover:text-game-accent-hover"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(null)}
                        className="text-xs px-1.5"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingId(ann._id)}
                      className="text-xs px-1.5"
                      title="Delete"
                    >
                      🗑️
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
