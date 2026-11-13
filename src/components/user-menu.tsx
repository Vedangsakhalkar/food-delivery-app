"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/components/cart/cart-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  const { clear } = useCart();

  async function logOut() {
    await createSupabaseBrowserClient().auth.signOut();
    clear();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
        {name} ▾
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={logOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
