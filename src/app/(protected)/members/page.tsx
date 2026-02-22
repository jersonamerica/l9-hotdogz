import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MemberDirectory from "@/components/MemberDirectory";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/members_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 pb-24">
        <main className="w-[90%] mx-auto py-8">
          <MemberDirectory
            isAdmin={(session?.user as { role?: string })?.role === "admin"}
          />
        </main>
      </div>
    </div>
  );
}
