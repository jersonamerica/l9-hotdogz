import DashboardContent from "@/components/DashboardContent";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/dashboard_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}
