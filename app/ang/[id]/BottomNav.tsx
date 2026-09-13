"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BottomNav({
  angNumber,
  maxAng,
  minAng,
}: {
  angNumber: number;
  maxAng: number;
  minAng: number;
}) {
  const [visible, setVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setVisible(true);
      } else if (currentScrollY > prevScrollY + 5) {
        setVisible(false); // scroll down -> hide bar so reader isn't interrupted
      } else if (currentScrollY < prevScrollY - 5) {
        setVisible(true); // scroll up -> reveal
      }
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

  return (
    <footer
      className={`fixed inset-x-0 bottom-0 z-20 glass-nav-pinned transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-1.5 sm:px-8">
        <NavLink href={`/ang/${angNumber - 1}`} disabled={angNumber <= minAng} direction="prev" />
        <span className="text-xs font-medium text-[var(--text-muted)]">Ang {angNumber}</span>
        <NavLink href={`/ang/${angNumber + 1}`} disabled={angNumber >= maxAng} direction="next" />
      </div>
    </footer>
  );
}

function NavLink({
  href,
  disabled,
  direction,
}: {
  href: string;
  disabled: boolean;
  direction: "prev" | "next";
}) {
  const label = direction === "prev" ? "Previous" : "Next";
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  if (disabled) {
    return (
      <span className="flex min-h-[44px] items-center gap-1 px-3 text-xs font-medium text-[var(--text-faint)] opacity-20">
        {direction === "prev" && <Icon size={16} />}
        {label}
        {direction === "next" && <Icon size={16} />}
      </span>
    );
  }

  return (
    <Link
      href={href}
      prefetch
      className="flex min-h-[44px] items-center gap-1 px-3 text-xs font-semibold text-[var(--accent)] transition-opacity hover:opacity-75 active:scale-[0.97]"
    >
      {direction === "prev" && <Icon size={16} />}
      {label}
      {direction === "next" && <Icon size={16} />}
    </Link>
  );
}
