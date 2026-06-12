"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Volume2 } from "lucide-react";

import { CardShell } from "@/components/CardShell";
import type { REMiVoiceNote } from "@/lib/types";

interface VoiceNoteCardProps {
  voiceNote: REMiVoiceNote;
}

export function VoiceNoteCard({ voiceNote }: VoiceNoteCardProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);

  return (
    <CardShell
      className="overflow-hidden bg-[linear-gradient(145deg,rgba(247,230,233,.78),rgba(235,228,245,.72))] p-6 sm:p-8"
      delay={0.2}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Voice note</p>
          <h2 className="display-font mt-2 text-[2rem] leading-none">
            {voiceNote.voice_note_title}
          </h2>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/75 bg-white/55 text-plum">
          <Volume2 size={18} />
        </div>
      </div>

      <p className="mt-6 text-[15px] leading-[1.8] text-[#5f5868]">
        “{voiceNote.voice_note_script}”
      </p>

      <div className="mt-7 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsPreviewing((current) => !current)}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-plum text-white shadow-[0_10px_25px_rgba(105,91,137,.22)] transition-transform hover:scale-105"
          aria-label={isPreviewing ? "Pause voice note" : "Preview voice note"}
        >
          {isPreviewing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex h-8 items-center gap-1">
            {Array.from({ length: 28 }).map((_, index) => (
              <motion.span
                key={index}
                className="w-1 rounded-full bg-[#8f7ba5]/55"
                animate={
                  isPreviewing
                    ? { height: [5, 8 + ((index * 7) % 18), 5] }
                    : { height: 5 + ((index * 5) % 12) }
                }
                transition={{
                  duration: 0.8 + (index % 4) * 0.14,
                  repeat: isPreviewing ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <p className="mt-1 text-[10px] text-[#8c8291]">
            Voice preview mocked for demo.
          </p>
        </div>
      </div>
    </CardShell>
  );
}
