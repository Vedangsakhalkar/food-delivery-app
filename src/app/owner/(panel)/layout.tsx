import { OwnerNav } from "@/components/owner/owner-nav";

export default function OwnerPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <OwnerNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
