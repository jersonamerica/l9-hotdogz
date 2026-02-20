import MountsBoard from "@/components/MountsBoard";

export default function MountsPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/abilities_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 pb-24">
        <main className="w-[90%] mx-auto py-8">
          <MountsBoard />
        </main>
      </div>
    </div>
  );
}
