import AbilitiesBoard from "@/components/AbilitiesBoard";

export default function AbilitiesPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/abilities_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 pb-24">
        <main className="w-[90%] mx-auto py-8">
          <AbilitiesBoard />
        </main>
      </div>
    </div>
  );
}
