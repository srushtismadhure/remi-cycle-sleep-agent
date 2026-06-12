import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { ProtocolCard } from "@/components/ProtocolCard";
import { VoiceNoteCard } from "@/components/VoiceNoteCard";
import { runDemoAgent } from "@/lib/demoAgent";

export default function ProtocolPage() {
  const result = runDemoAgent();

  return (
    <main className="min-h-screen pb-32">
      <AppHeader overline="Your evening ritual" />
      <section className="mx-auto w-full max-w-3xl px-5 pb-8 pt-8 sm:px-8">
        <p className="eyebrow text-center">Tonight's protocol</p>
        <h1 className="display-font mt-3 text-center text-4xl sm:text-5xl">
          A ritual that meets your body.
        </h1>
        <p className="mx-auto mb-10 mt-4 max-w-md text-center text-sm leading-relaxed text-[#766f7c]">
          A calm, time-boxed sequence built from tonight's synthetic signals.
        </p>
        <div className="grid gap-5">
          <ProtocolCard plan={result.plan} />
          <VoiceNoteCard voiceNote={result.voiceNote} />
        </div>
      </section>
      <BottomNav active="protocol" />
    </main>
  );
}
