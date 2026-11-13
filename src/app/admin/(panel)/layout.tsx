import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
