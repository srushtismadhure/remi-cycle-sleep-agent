import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { MoonOrb } from "@/components/MoonOrb";
import { ResultsView } from "@/components/ResultsView";
import { runDemoAgent } from "@/lib/demoAgent";

export default function TonightPage() {
  const result = runDemoAgent();

  return (
    <main className="min-h-screen pb-32">
      <AppHeader overline="Thursday, June 11" />
      <section className="mx-auto w-full max-w-3xl px-5 pb-6 pt-5 text-center sm:px-8">
        <div className="mx-auto -mb-3 grid w-fit place-items-center">
          <MoonOrb riskLevel={result.riskProfile.risk_level} size="compact" />
        </div>
        <p className="eyebrow">Tonight's outlook</p>
        <h1 className="display-font mt-2 text-4xl sm:text-5xl">
          Let the day get quieter.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#766f7c]">
          REMi found a few signs that your body may benefit from a slower
          transition into sleep.
        </p>
      </section>
      <section className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <ResultsView result={result} />
      </section>
      <BottomNav active="tonight" />
    </main>
  );
}
