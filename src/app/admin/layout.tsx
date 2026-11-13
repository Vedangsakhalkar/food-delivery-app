import { ROLES_FOR } from "@/lib/access-rules";
import { requirePageUser } from "@/lib/page-guard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser(ROLES_FOR.admin);
  return <>{children}</>;
}
