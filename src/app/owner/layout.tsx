import { ROLES_FOR } from "@/lib/access-rules";
import { requirePageUser } from "@/lib/page-guard";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser(ROLES_FOR.owner);
  return <>{children}</>;
}
