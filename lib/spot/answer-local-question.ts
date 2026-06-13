import { normalizeSpotQuestion } from "@/lib/spot/classify-question";
import type { SpotTonightContext } from "@/lib/spot/types";

function labelPhase(phase: string) {
  return phase
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatNumber(value: number, suffix = "") {
  const normalized = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${normalized}${suffix}`;
}

function noPlanAnswer() {
  return {
    answer:
      "Run Tonight's Protocol first and I can explain the synthetic signals, haptic choice, and friction score from the current demo record.",
    localSignals: [],
  };
}

export function answerLocalQuestion(
  question: string,
  context: SpotTonightContext,
) {
  if (!context.hasPlan) {
    return noPlanAnswer();
  }

  const normalized = normalizeSpotQuestion(question);

  if (/\bhrv|heart rate variability\b/.test(normalized)) {
    if (typeof context.hrvRmssdMs !== "number") {
      return {
        answer: "No HRV measurement is available in tonight’s synthetic record.",
        localSignals: [],
      };
    }

    return {
      answer: `Your overnight HRV in tonight’s synthetic record is ${formatNumber(context.hrvRmssdMs, " ms")}.`,
      localSignals: [`HRV ${formatNumber(context.hrvRmssdMs, " ms")}`],
    };
  }

  if (/\bresting heart rate|resting hr\b/.test(normalized)) {
    if (typeof context.restingHeartRateBpm !== "number") {
      return {
        answer:
          "No resting heart rate measurement is available in tonight’s synthetic record.",
        localSignals: [],
      };
    }

    return {
      answer: `Your resting heart rate in tonight’s synthetic record is ${formatNumber(context.restingHeartRateBpm, " bpm")}.`,
      localSignals: [
        `Resting HR ${formatNumber(context.restingHeartRateBpm, " bpm")}`,
      ],
    };
  }

  if (/\bcycle phase|phase am i in|cycle day\b/.test(normalized)) {
    const parts: string[] = [];
    if (context.cyclePhase) {
      parts.push(labelPhase(context.cyclePhase));
    }
    if (typeof context.cycleDay === "number") {
      parts.push(`day ${context.cycleDay}`);
    }

    if (parts.length === 0) {
      return {
        answer: "No cycle-phase estimate is available in tonight’s synthetic record.",
        localSignals: [],
      };
    }

    return {
      answer: `Tonight’s synthetic record is estimated as ${parts.join(", ")}.`,
      localSignals: parts,
    };
  }

  if (/\bstress score|\bstress\b/.test(normalized)) {
    if (typeof context.stress !== "number") {
      return {
        answer: "No stress score is available in tonight’s synthetic record.",
        localSignals: [],
      };
    }

    return {
      answer: `Tonight’s synthetic stress score is ${formatNumber(context.stress, "/10")}.`,
      localSignals: [`Stress ${formatNumber(context.stress, "/10")}`],
    };
  }

  if (/\bsleep friction score|friction score\b/.test(normalized)) {
    if (typeof context.sleepFrictionScore !== "number") {
      return {
        answer:
          "No Sleep Friction Score is available in tonight’s synthetic record.",
        localSignals: [],
      };
    }

    return {
      answer: `Tonight’s Sleep Friction Score is ${formatNumber(context.sleepFrictionScore, "/10")}.`,
      localSignals: [
        `Sleep Friction Score ${formatNumber(context.sleepFrictionScore, "/10")}`,
      ],
    };
  }

  if (/\bwhy is my friction score high|risk drivers|why this plan\b/.test(normalized)) {
    const drivers = context.riskDrivers?.filter(Boolean) ?? [];

    return {
      answer:
        drivers.length > 0
          ? `Tonight’s Sleep Friction Score is being pushed mainly by ${drivers.join(" ")}`
          : "Tonight’s synthetic record does not include clear risk drivers beyond the available sleep and recovery signals.",
      localSignals: drivers.slice(0, 3),
    };
  }

  if (/\bhaptic|soft wave|gentle drift|deep reset|breathing session|duration\b/.test(normalized)) {
    const details = [
      context.selectedHaptic,
      typeof context.hapticDurationMinutes === "number"
        ? `${context.hapticDurationMinutes} minutes`
        : undefined,
      typeof context.breathRatePerMinute === "number"
        ? `${context.breathRatePerMinute} breaths/min`
        : undefined,
    ].filter(Boolean) as string[];

    if (!context.selectedHaptic) {
      return {
        answer: "No haptic selection is available in tonight’s synthetic record.",
        localSignals: [],
      };
    }

    return {
      answer: `REMi selected ${context.selectedHaptic} for tonight’s plan${details.length > 1 ? `, with ${details.slice(1).join(" and ")}` : ""}.`,
      localSignals: details,
    };
  }

  if (/\brecommend|tonight s plan|what did remi recommend\b/.test(normalized)) {
    const protocol = context.recommendationText ?? "tonight’s wind-down";
    const summary = context.planSummary ?? "REMi prepared a gentle wellness plan.";

    return {
      answer: `${summary} The stored recommendation for tonight is ${protocol}.`,
      localSignals: [protocol],
    };
  }

  if (/\bluteinizing hormone\b/.test(normalized)) {
    if (typeof context.lh !== "number") {
      return {
        answer:
          "No LH measurement is available in tonight’s data, so I cannot give a personalized LH value.",
        localSignals: [],
      };
    }

    return {
      answer: `Tonight’s synthetic LH measurement is ${formatNumber(context.lh, " mIU/mL")}.`,
      localSignals: [`LH ${formatNumber(context.lh, " mIU/mL")}`],
    };
  }

  if (/\bfollicle stimulating hormone\b/.test(normalized)) {
    return {
      answer:
        "No FSH measurement is available in tonight’s data, so this is general research context rather than a personalized interpretation.",
      localSignals: [],
    };
  }

  if (/\bestrone 3 glucuronide|estrogen\b/.test(normalized)) {
    if (typeof context.estrogenE3g !== "number") {
      return {
        answer:
          "No E3G measurement is available in tonight’s data, so I cannot give a personalized estrogen-metabolite value.",
        localSignals: [],
      };
    }

    return {
      answer: `Tonight’s synthetic E3G measurement is ${formatNumber(context.estrogenE3g, " ng/mL")}.`,
      localSignals: [`E3G ${formatNumber(context.estrogenE3g, " ng/mL")}`],
    };
  }

  if (/\bpregnanediol glucuronide|progesterone\b/.test(normalized)) {
    if (typeof context.progesteronePdg !== "number") {
      return {
        answer:
          "No PdG measurement is available in tonight’s data, so I cannot give a personalized progesterone-metabolite value.",
        localSignals: [],
      };
    }

    return {
      answer: `Tonight’s synthetic PdG measurement is ${formatNumber(context.progesteronePdg, " ug/mL")}.`,
      localSignals: [`PdG ${formatNumber(context.progesteronePdg, " ug/mL")}`],
    };
  }

  return {
    answer:
      "I can explain tonight’s synthetic plan, signals, haptic selection, and friction drivers from the current demo record.",
    localSignals: [],
  };
}
