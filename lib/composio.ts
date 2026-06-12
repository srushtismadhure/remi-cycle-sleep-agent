import type { REMiAction, REMiSleepPlan } from "@/lib/types";

export function triggerBedtimeActions(plan: REMiSleepPlan): REMiAction[] {
  return [
    {
      label: "Google Calendar",
      status: "completed",
      detail: `Wind-down block scheduled for ${plan.start_time}.`,
    },
    {
      label: "Google Sheets",
      status: "completed",
      detail: "Synthetic sleep log updated with tonight's plan.",
    },
    {
      label: "Gentle reminder",
      status: "drafted",
      detail: plan.reminder_text,
    },
    {
      label: "Evidence card",
      status: "mocked",
      detail: "Tonight's wellness evidence was saved for review.",
    },
  ];
}
