import BottomNav from "@/components/customer/bottom-nav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
