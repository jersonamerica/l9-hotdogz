"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface Participant {
  _id: string;
  name: string;
  image?: string;
}

interface EventData {
  _id: string;
  title: string;
  participants: Participant[];
  createdBy: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface Member {
  _id: string;
  name: string;
  image?: string;
  attendancePoints?: number;
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const queryClient = useQueryClient();
  const { data: events = [] } = useQuery<EventData[]>({
    queryKey: ["events"],
    queryFn: () => fetcher<EventData[]>("/api/events"),
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: () => fetcher<Member[]>("/api/members"),
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      participantIds: string[];
    }) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to create event");
      }
      return res.json();
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      title: string;
      participantIds: string[];
    }) => {
      const res = await fetch(`/api/events/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          participantIds: payload.participantIds,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to update event");
      }
      return res.json();
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete event");
      }
      return res.json();
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Success dialog
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Expanded event state
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>(
    {},
  );

  const openCreateModal = () => {
    setTitle("");
    setSelectedParticipants([]);
    setSearchQuery("");
    setEditingEvent(null);
    setShowCreateModal(true);
  };

  const openEditModal = (event: EventData) => {
    setTitle(event.title);
    setSelectedParticipants(event.participants.map((p) => p._id));
    setSearchQuery("");
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    setTitle("");
    setSelectedParticipants([]);
    setSearchQuery("");
  };

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const selectAll = () => {
    setSelectedParticipants(members.map((m) => m._id));
  };

  const deselectAll = () => {
    setSelectedParticipants([]);
  };

  const handleSave = async () => {
    if (!title.trim() || selectedParticipants.length === 0) return;

    setSaving(true);
    try {
      if (editingEvent) {
        await updateEventMutation.mutateAsync({
          id: editingEvent._id,
          title: title.trim(),
          participantIds: selectedParticipants,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["events"] }),
          queryClient.invalidateQueries({ queryKey: ["members"] }),
        ]);
        closeModal();
        setSuccessMessage("Event updated successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        await createEventMutation.mutateAsync({
          title: title.trim(),
          participantIds: selectedParticipants,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["events"] }),
          queryClient.invalidateQueries({ queryKey: ["members"] }),
        ]);
        closeModal();
        setSuccessMessage("Event created successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEventId) return;

    try {
      await deleteEventMutation.mutateAsync(deletingEventId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events"] }),
        queryClient.invalidateQueries({ queryKey: ["members"] }),
      ]);
      setShowDeleteConfirm(false);
      setDeletingEventId(null);
      setSuccessMessage("Event deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const filteredMembers = members.filter((m) =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url(/bg/attendance_bg.jpg)" }}
    >
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8 flex gap-6">
          {/* Left Sidebar - Members Attendance Points */}
          <div className="hidden lg:block w-1/4">
            <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl overflow-hidden sticky top-8">
              <div className="px-4 py-3 border-b border-game-border bg-game-darker/50">
                <h3 className="text-sm font-bold text-game-accent">
                  Attendance Points
                </h3>
                <p className="text-xs text-game-text-muted mt-1">
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="divide-y divide-game-border">
                  {[...members]
                    .sort(
                      (a, b) =>
                        (b.attendancePoints || 0) - (a.attendancePoints || 0),
                    )
                    .map((member) => (
                      <div
                        key={member._id}
                        className="px-4 py-3 hover:bg-game-darker/50 transition-colors"
                      >
                        <p className="text-xs font-medium text-game-text truncate">
                          {member.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-game-accent font-semibold">
                            {member.attendancePoints || 0}
                          </span>
                          <span className="text-xs text-game-text-muted">
                            points
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Events */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-game-accent">
                Attendance Events
              </h2>
              {isAdmin && (
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-game-accent rounded-lg hover:bg-game-accent-hover transition-colors cursor-pointer"
                >
                  + Add Event
                </button>
              )}
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-8 text-center">
                  <p className="text-game-text-muted text-sm">
                    No events recorded yet.
                  </p>
                </div>
              ) : (
                events.map((event) => {
                  const isExpanded = expandedEvents[event._id] || false;

                  return (
                    <div
                      key={event._id}
                      className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl overflow-hidden"
                    >
                      {/* Event Header */}
                      <button
                        onClick={() => toggleExpand(event._id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-game-card-hover/50 transition-colors"
                      >
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-semibold text-game-text truncate">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-game-text-muted">
                              {formatDate(event.createdAt)}
                            </span>
                            <span className="text-xs text-game-accent">
                              {event.participants.length} participant
                              {event.participants.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <svg
                            className={`w-4 h-4 text-game-text-muted transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-5 py-4 border-t border-game-border bg-game-darker/30">
                          <p className="text-xs font-medium text-game-text-muted uppercase tracking-wider mb-3">
                            Participants
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {event.participants.map((participant) => (
                              <div
                                key={participant._id}
                                className="flex items-center gap-2 text-xs text-game-text p-2 rounded bg-game-card/50"
                              >
                                <span className="text-green-400">•</span>
                                <span className="truncate">
                                  {participant.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-game-border">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => openEditModal(event)}
                                  className="px-3 py-1 text-xs font-medium text-game-accent hover:text-game-accent-hover transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingEventId(event._id);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Create/Edit Modal */}
          {isAdmin && showCreateModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
              <div className="bg-game-card border border-game-border rounded-xl p-6 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
                <h3 className="text-lg font-bold text-game-accent mb-4">
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </h3>

                {/* Event Title */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-game-text-muted uppercase tracking-wider mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title..."
                    className="w-full px-3 py-2 text-sm bg-game-darker border border-game-border rounded-lg text-game-text placeholder-game-text-muted/50 focus:outline-none focus:border-game-accent"
                  />
                </div>

                {/* Participants */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-game-text-muted uppercase tracking-wider">
                      Participants ({selectedParticipants.length}/
                      {members.length})
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="text-xs text-game-accent hover:text-game-accent-hover cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        onClick={deselectAll}
                        className="text-xs text-game-text-muted hover:text-game-text cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members..."
                    className="w-full px-3 py-2 text-sm bg-game-darker border border-game-border rounded-lg text-game-text placeholder-game-text-muted/50 focus:outline-none focus:border-game-accent mb-2"
                  />

                  {/* Members List */}
                  <div className="flex-1 overflow-y-auto space-y-1 max-h-60 pr-1">
                    {filteredMembers.map((member) => {
                      const isSelected = selectedParticipants.includes(
                        member._id,
                      );
                      return (
                        <div
                          key={member._id}
                          onClick={() => toggleParticipant(member._id)}
                          className={`flex items-center gap-2 text-xs p-2 rounded cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-game-accent/20 text-game-text"
                              : "text-game-text-muted hover:bg-game-darker/50"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 flex items-center justify-center ${
                              isSelected
                                ? "text-green-400"
                                : "text-game-text-muted"
                            }`}
                          >
                            {isSelected ? "✓" : "✗"}
                          </span>
                          <span className="truncate">{member.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-game-border">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-medium text-game-text-muted hover:text-game-text border border-game-border rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={
                      saving ||
                      !title.trim() ||
                      selectedParticipants.length === 0
                    }
                    className="px-4 py-2 text-xs font-medium text-white bg-game-accent rounded-lg hover:bg-game-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {saving
                      ? "Saving..."
                      : editingEvent
                        ? "Update Event"
                        : "Create Event"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {isAdmin && showDeleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
              <div className="bg-game-card border border-game-border rounded-xl p-6 shadow-2xl max-w-sm mx-4">
                <h3 className="text-sm font-bold text-game-text mb-2">
                  Delete Event
                </h3>
                <p className="text-xs text-game-text-muted mb-4">
                  Are you sure? This will also remove the attendance points from
                  all participants of this event.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletingEventId(null);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-game-text-muted hover:text-game-text border border-game-border rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Dialog */}
          {showSuccess && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
              <div className="bg-game-card border border-game-border rounded-lg p-6 shadow-2xl max-w-sm mx-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-green-400/20">
                    <svg
                      className="w-6 h-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400">
                      Success
                    </p>
                    <p className="text-xs text-game-text mt-1">
                      {successMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
