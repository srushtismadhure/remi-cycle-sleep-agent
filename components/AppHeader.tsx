import Link from "next/link";

interface AppHeaderProps {
  overline?: string;
}

export function AppHeader({ overline = "Tonight, understood" }: AppHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <Link href="/" className="display-font text-[1.75rem] text-ink">
        REM<span className="text-[#9982ae]">i</span>
      </Link>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f7788]">
        <span className="h-1.5 w-1.5 rounded-full bg-sage shadow-[0_0_0_4px_rgba(157,184,165,.14)]" />
        {overline}
      </div>
    </header>
  );
}
