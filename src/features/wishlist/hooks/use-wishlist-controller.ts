"use client";

import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store/hooks";
import { selectWishlistItems } from "@/store/wishlistSlice";

export function useWishlistController() {
  const items = useAppSelector(selectWishlistItems);
  const { data: session } = useSession();

  const isAuthed = Boolean(session?.user?.email);
  const isEmpty = items.length === 0;

  return {
    items,
    session,
    isAuthed,
    isEmpty,
  };
}
