import { AddressesCard } from "@/components/profile/addresses-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { requirePageUser } from "@/lib/page-guard";

export const metadata = { title: "My profile | Foodzie" };

export default async function ProfilePage() {
  const user = await requirePageUser();
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">My profile</h1>
      <ProfileForm initial={{ name: user.name, phone: user.phone ?? "", email: user.email }} />
      <AddressesCard />
    </div>
  );
}
