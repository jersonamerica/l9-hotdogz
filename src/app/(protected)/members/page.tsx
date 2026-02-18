import MemberDirectory from "@/components/MemberDirectory";

export default function MembersPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/members_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8">
          <MemberDirectory />
        </main>
      </div>
    </div>
  );
}
