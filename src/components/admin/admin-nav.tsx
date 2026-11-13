import { SideNav } from "@/components/side-nav";

const LINKS = [
  { href: "/admin/restaurants", label: "Restaurants" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminNav() {
  return <SideNav links={LINKS} />;
}
