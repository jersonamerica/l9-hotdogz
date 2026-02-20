import ProfileEditor from "@/components/ProfileEditor";

export default function ProfilePage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/profile_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 pb-24">
        <main className="w-[90%] mx-auto py-12">
          <ProfileEditor />
        </main>
      </div>
    </div>
  );
}
