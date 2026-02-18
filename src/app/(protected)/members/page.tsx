import MemberDirectory from "@/components/MemberDirectory";

export default function MembersPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/members_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8">
          <h2 className="text-2xl font-bold text-game-text mb-6 flex items-center gap-2">
            <span>👥</span> Guild Members
          </h2>
          <MemberDirectory />
        </main>
      </div>
    </div>
  );
}
