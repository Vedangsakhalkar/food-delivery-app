import { SideNav } from "@/components/side-nav";

const LINKS = [
  { href: "/owner/restaurant", label: "Restaurant profile" },
  { href: "/owner/menu", label: "Menu" },
  { href: "/owner/orders", label: "Live orders" },
  { href: "/owner/history", label: "Order history" },
];

export function OwnerNav() {
  return <SideNav links={LINKS} />;
}
