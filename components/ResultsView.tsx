import { ActionLog } from "@/components/ActionLog";
import { EvidenceCard } from "@/components/EvidenceCard";
import { ProtocolCard } from "@/components/ProtocolCard";
import { RiskCard } from "@/components/RiskCard";
import { TonightCard } from "@/components/TonightCard";
import { VoiceNoteCard } from "@/components/VoiceNoteCard";
import type { REMiAgentResult } from "@/lib/types";

interface ResultsViewProps {
  result: REMiAgentResult;
}

export function ResultsView({ result }: ResultsViewProps) {
  return (
    <div className="grid gap-5 sm:gap-6">
      <TonightCard signals={result.signals} />
      <RiskCard riskProfile={result.riskProfile} />
      <ProtocolCard plan={result.plan} />
      <EvidenceCard evidence={result.evidence} />
      <ActionLog actions={result.actions} />
      <VoiceNoteCard voiceNote={result.voiceNote} />
    </div>
  );
}
