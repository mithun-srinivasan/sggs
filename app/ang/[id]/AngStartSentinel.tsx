"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AngStartSentinel({
  angNumber,
  minAng,
}: {
  angNumber: number;
  minAng: number;
}) {
  const router = useRouter();
  const previousScrollY = useRef(0);
  const hasScrolledDown = useRef(false);
  const triggered = useRef(false);
  const isFirstAng = angNumber <= minAng;

  useEffect(() => {
    if (isFirstAng) return;

    previousScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledDown = currentScrollY > previousScrollY.current + 5;
      const reachedTop = currentScrollY <= 8;
      const scrollingUp = currentScrollY < previousScrollY.current - 5;

      if (scrolledDown) {
        hasScrolledDown.current = true;
      }

      if (reachedTop && scrollingUp && hasScrolledDown.current && !triggered.current) {
        triggered.current = true;
        router.push(`/ang/${angNumber - 1}`);
      }

      previousScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [angNumber, isFirstAng, router]);

  return null;
}