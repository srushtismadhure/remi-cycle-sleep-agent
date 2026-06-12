import evidenceMock from "@/data/evidenceMock.json";
import type {
  REMiEvidenceItem,
  REMiRiskProfile,
  REMiSignals,
} from "@/lib/types";

export function retrieveEvidence(
  _riskProfile?: REMiRiskProfile,
  _signals?: REMiSignals,
): REMiEvidenceItem[] {
  return evidenceMock as REMiEvidenceItem[];
}
