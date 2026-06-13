import Link from "next/link";
import { Menu } from "lucide-react";

interface AppHeaderProps {
  overline?: string;
  variant?: "light" | "dark";
  showMenu?: boolean;
}

export function AppHeader({
  overline = "Tonight, understood",
  variant = "light",
  showMenu = false,
}: AppHeaderProps) {
  const isDark = variant === "dark";

  return (
    <header className="relative z-40 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
      <Link
        href="/"
        className={`text-[1.35rem] font-black tracking-[0.16em] ${
          isDark ? "text-[#f8f5ff]" : "text-ink"
        }`}
      >
        REM<span className={isDark ? "text-[#f3a7c7]" : "text-[#9982ae]"}>i</span>
      </Link>

      {showMenu ? (
        <details className="hero-menu relative">
          <summary
            className={`grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border backdrop-blur-xl transition ${
              isDark
                ? "border-white/15 bg-white/[0.05] text-[#f8f5ff] hover:border-[#f6a6c8]/50 hover:bg-[#f6a6c8]/10"
                : "border-[#dcd3e1] bg-white/60 text-ink hover:bg-white"
            }`}
            aria-label="Open navigation"
          >
            <Menu size={18} strokeWidth={1.8} />
          </summary>
          <nav className="absolute right-0 top-14 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1028]/90 p-2 text-sm text-[#f8f5ff] shadow-2xl backdrop-blur-2xl">
            <Link className="block rounded-xl px-4 py-3 hover:bg-white/[0.07]" href="/tonight">
              Tonight
            </Link>
          </nav>
        </details>
      ) : (
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f7788]">
          <span className="h-1.5 w-1.5 rounded-full bg-sage shadow-[0_0_0_4px_rgba(157,184,165,.14)]" />
          {overline}
        </div>
      )}
    </header>
  );
}
