"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { MOUNTS } from "@/lib/mounts";
import { useCrudMutation } from "@/hooks/useCrudMutation";
import { Button, Card, CardBody, CardHeader, Input } from "@/components/ui";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface Member {
  _id: string;
  name: string;
  image?: string;
  cp: number;
  mastery?: string;
  role?: string;
  userMounts?: string[];
}

interface UpdateMountsPayload {
  userId: string;
  userMounts: string[];
}

export default function MountsBoard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: () => fetcher<Member[]>("/api/members"),
  });

  const updateMountsMutation = useCrudMutation<UpdateMountsPayload, Member>({
    method: "PUT",
    url: "/api/user",
    invalidateKeys: [["members"], ["user"], ["activity"]],
  });

  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter((member) =>
      (member.name || "").toLowerCase().includes(q),
    );
  }, [members, search]);

  const toggleMount = async (member: Member, mount: string) => {
    const key = `${member._id}:${mount}`;
    if (pending[key]) return;

    const current = member.userMounts || [];
    const hasMount = current.includes(mount);
    const nextMounts = hasMount
      ? current.filter((item) => item !== mount)
      : [...current, mount];

    setPending((prev) => ({ ...prev, [key]: true }));
    try {
      await updateMountsMutation.mutateAsync({
        userId: member._id,
        userMounts: nextMounts,
      });
    } finally {
      setPending((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-game-border border-t-game-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-game-accent">Mounts</h2>
          <p className="text-sm text-game-text-muted">
            Track who has each mount.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members..."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOUNTS.map((mount) => {
          const withMount = filteredMembers.filter((member) =>
            (member.userMounts || []).includes(mount),
          );
          const withoutMount = filteredMembers.filter(
            (member) => !(member.userMounts || []).includes(mount),
          );
          const topWithoutMount = [...withoutMount]
            .sort((a, b) => b.cp - a.cp)
            .slice(0, 5);

          const renderMemberRow = (member: Member, label: string) => {
            const key = `${member._id}:${mount}`;
            return (
              <div
                key={member._id}
                className="flex items-center justify-between gap-3 rounded-lg border border-game-border bg-game-darker/60 px-3 py-2"
              >
                <span className="text-sm text-game-text">{member.name}</span>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleMount(member, mount)}
                    disabled={pending[key]}
                  >
                    {label}
                  </Button>
                )}
              </div>
            );
          };

          return (
            <Card key={mount} variant="glass" padding="sm">
              <CardHeader
                action={
                  <span className="text-xs text-game-text-muted">
                    {withMount.length} owned / {withoutMount.length} open
                  </span>
                }
              >
                {mount}
              </CardHeader>
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-green-400">
                    Have it
                  </div>
                  <div className="mt-2 space-y-2">
                    {withMount.length === 0 ? (
                      <p className="text-xs text-game-text-muted">None yet.</p>
                    ) : (
                      withMount.map((member) =>
                        renderMemberRow(member, "Remove"),
                      )
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-red-400">
                    Don&apos;t have it
                  </div>
                  <div className="mt-2 space-y-2">
                    {withoutMount.length === 0 ? (
                      <p className="text-xs text-game-text-muted">
                        Everyone has this mount.
                      </p>
                    ) : (
                      topWithoutMount.map((member) =>
                        renderMemberRow(member, "Mark"),
                      )
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
