"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useSwipeNavigation } from "@/lib/useSwipeNavigation";
import { clampAng } from "@/lib/data";
import { MAX_ANG, MIN_ANG } from "@/lib/types";

export default function SwipeContainer({
  angNumber,
  children,
}: {
  angNumber: number;
  children: ReactNode;
}) {
  const router = useRouter();

  const goTo = (n: number) => router.push(`/ang/${clampAng(n)}`);

  const swipeHandlers = useSwipeNavigation(
    () => angNumber < MAX_ANG && goTo(angNumber + 1), // swipe left -> next
    () => angNumber > MIN_ANG && goTo(angNumber - 1)  // swipe right -> prev
  );

  return (
    <div {...swipeHandlers} className="touch-pan-y">
      {children}
    </div>
  );
}
