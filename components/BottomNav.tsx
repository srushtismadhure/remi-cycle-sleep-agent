"use client";

import Link from "next/link";
import { ListChecks, MoonStar, Waves } from "lucide-react";

interface BottomNavProps {
  active: "tonight" | "protocol" | "actions";
}

const items = [
  { key: "tonight", label: "Tonight", href: "/tonight", icon: MoonStar },
  { key: "protocol", label: "Protocol", href: "/protocol", icon: Waves },
  { key: "actions", label: "Actions", href: "/action-log", icon: ListChecks },
] as const;

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-md rounded-[24px] border border-white/70 bg-white/72 p-2 shadow-[0_16px_48px_rgba(63,49,83,.18)] backdrop-blur-2xl">
      <div className="grid grid-cols-3">
        {items.map(({ key, label, href, icon: Icon }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-[18px] px-3 py-2.5 text-[10px] font-semibold transition ${
                isActive
                  ? "bg-[#eee8f3] text-plum"
                  : "text-[#8c8493] hover:text-plum"
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.7} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
