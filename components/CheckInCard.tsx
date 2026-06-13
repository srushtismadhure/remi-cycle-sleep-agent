"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  useId,
  useState,
} from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {
  CHECK_IN_FEELINGS,
  CHECK_IN_SLIDERS,
  type CheckInData,
  type CheckInFeeling,
  type CheckInSlider,
} from "@/lib/checkIn";

interface CheckInCardProps {
  isSubmitting?: boolean;
  onSave: (data: CheckInData) => void;
  onSkip: () => void;
}

const initialDetails: Record<CheckInSlider, number> = {
  Stress: 4,
  Fatigue: 3,
  "Sleep issue": 4,
  Cramps: 2,
  Bloating: 4,
};

const chipTone: Record<CheckInFeeling, string> = {
  Wired: "plum",
  Tired: "lavender",
  Crampy: "blush",
  Bloated: "peach",
  Anxious: "lavender",
  Restless: "blue",
  Calm: "sage",
  Warm: "peach",
  Headachy: "blush",
};

function sliderBackground(value: number) {
  const progress = ((value - 1) / 4) * 100;

  return {
    background: `linear-gradient(90deg, #cf86aa 0%, #aa8fc8 ${progress}%, #eee6ef ${progress}%, #eee6ef 100%)`,
  } satisfies CSSProperties;
}

export function CheckInCard({
  isSubmitting = false,
  onSave,
  onSkip,
}: CheckInCardProps) {
  const idPrefix = useId();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFeelings, setSelectedFeelings] = useState<
    CheckInFeeling[]
  >(["Wired", "Crampy"]);
  const [details, setDetails] =
    useState<Record<CheckInSlider, number>>(initialDetails);
  const [note, setNote] = useState("I feel tired but wired.");

  function toggleFeeling(feeling: CheckInFeeling) {
    setSelectedFeelings((current) =>
      current.includes(feeling)
        ? current.filter((item) => item !== feeling)
        : [...current, feeling],
    );
  }

  function updateDetail(
    detail: CheckInSlider,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value = Number(event.currentTarget.value);

    setDetails((current) => ({
      ...current,
      [detail]: value,
    }));
  }

  function saveCheckIn() {
    onSave({
      feelings: selectedFeelings,
      details,
      note: note.trim(),
    });
  }

  return (
    <section
      id="body-check-in"
      className="check-in-section scroll-mt-4 px-5 py-20 sm:px-8 sm:py-24"
      aria-labelledby="check-in-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="check-in-intro">
          <p className="section-kicker">Daily symptoms</p>
          <h2
            id="check-in-title"
            className="display-font mt-3 text-[clamp(2.7rem,6vw,4.8rem)] leading-[0.96] text-ink"
          >
            A quick check-in for tonight.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#756a79] sm:text-base">
            Add today&apos;s symptoms if they matter tonight, or let your
            wearable signals speak for themselves.
          </p>
        </div>

        <div className="check-in-card mt-11">
          <div className="check-in-card-header">
            <div>
              <p className="check-in-heading">How does your body feel?</p>
              <p className="mt-2 text-sm text-[#6f6573]">
                Pick anything that fits.
              </p>
              <p className="mt-1 text-xs text-[#958a98]">
                REMi can also use wearable data only.
              </p>
            </div>

            <button
              type="button"
              className="check-in-detail-toggle"
              aria-expanded={isExpanded}
              aria-controls={`${idPrefix}-details`}
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? "Hide details" : "Add more detail"}
              {isExpanded ? (
                <ChevronUp size={16} aria-hidden="true" />
              ) : (
                <ChevronDown size={16} aria-hidden="true" />
              )}
            </button>
          </div>

          <div
            className="feeling-chip-list"
            aria-label="Select how your body feels"
          >
            {CHECK_IN_FEELINGS.map((feeling) => {
              const isSelected = selectedFeelings.includes(feeling);

              return (
                <button
                  key={feeling}
                  type="button"
                  aria-pressed={isSelected}
                  className={`feeling-chip feeling-chip-${chipTone[feeling]} ${
                    isSelected ? "feeling-chip-selected" : ""
                  }`}
                  onClick={() => toggleFeeling(feeling)}
                >
                  {feeling}
                </button>
              );
            })}
          </div>

          <div
            id={`${idPrefix}-details`}
            className={`check-in-details ${
              isExpanded ? "check-in-details-expanded" : ""
            }`}
            aria-hidden={!isExpanded}
          >
            <div className="check-in-details-inner">
              <div className="symptom-slider-grid">
                {CHECK_IN_SLIDERS.map((detail) => (
                  <div key={detail} className="symptom-slider">
                    <div className="symptom-slider-label">
                      <label htmlFor={`${idPrefix}-${detail}`}>{detail}</label>
                      <output htmlFor={`${idPrefix}-${detail}`}>
                        {details[detail]}/5
                      </output>
                    </div>
                    <input
                      id={`${idPrefix}-${detail}`}
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={details[detail]}
                      style={sliderBackground(details[detail])}
                      aria-valuetext={`${details[detail]} out of 5`}
                      tabIndex={isExpanded ? 0 : -1}
                      onChange={(event) => updateDetail(detail, event)}
                    />
                  </div>
                ))}
              </div>

              <div className="check-in-note">
                <label htmlFor={`${idPrefix}-note`}>Anything else?</label>
                <input
                  id={`${idPrefix}-note`}
                  type="text"
                  value={note}
                  maxLength={180}
                  tabIndex={isExpanded ? 0 : -1}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="check-in-actions">
            <button
              type="button"
              className="check-in-primary"
              disabled={isSubmitting}
              onClick={saveCheckIn}
            >
              <Sparkles size={16} aria-hidden="true" />
              {isSubmitting ? "Preparing your plan" : "Save Check-In"}
            </button>
            <button
              type="button"
              className="check-in-secondary"
              disabled={isSubmitting}
              onClick={onSkip}
            >
              Skip &amp; Use Wearable Data
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
