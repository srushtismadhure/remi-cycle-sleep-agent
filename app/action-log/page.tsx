import { ActionLog } from "@/components/ActionLog";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { EvidenceCard } from "@/components/EvidenceCard";
import { runDemoAgent } from "@/lib/demoAgent";

export default function ActionLogPage() {
  const result = runDemoAgent();

  return (
    <main className="min-h-screen pb-32">
      <AppHeader overline="Tonight's support" />
      <section className="mx-auto w-full max-w-3xl px-5 pb-8 pt-8 sm:px-8">
        <p className="eyebrow text-center">Action log</p>
        <h1 className="display-font mt-3 text-center text-4xl sm:text-5xl">
          Small steps, already in motion.
        </h1>
        <p className="mx-auto mb-10 mt-4 max-w-md text-center text-sm leading-relaxed text-[#766f7c]">
          A clear view of the gentle steps prepared for your evening.
        </p>
        <div className="grid gap-5">
          <ActionLog actions={result.actions} />
          <EvidenceCard evidence={result.evidence} />
        </div>
      </section>
      <BottomNav active="actions" />
    </main>
  );
}
