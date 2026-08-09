"use client";

import { useEffect, useState } from "react";
import type { Slide } from "@prisma/client";
import { useLiveSessionStore } from "@/lib/live-session-store";
import Sidebar from "./Sidebar";
import SlideCanvas from "./SlideCanvas";
import SessionTimer from "./SessionTimer";
import AIPracticePanel from "./AIPracticePanel";

interface Props {
  learnerFirstName: string;
  learnerMeta: { name: string; jobTitle: string | null; company: string | null };
  curriculumTitle: string;
  slides: Slide[];
  sessionId: string;
}

export default function PresentationShell({
  learnerFirstName,
  learnerMeta,
  curriculumTitle,
  slides,
  sessionId,
}: Props) {
  const { currentSlideIndex, setTotalSlides, goToSlide } = useLiveSessionStore();
  const [practiceOpen, setPracticeOpen] = useState(false);

  useEffect(() => {
    setTotalSlides(slides.length);
  }, [slides.length, setTotalSlides]);

  const activeSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-3">
        <div className="text-sm text-ink">
          <span className="font-medium">{learnerMeta.name}</span>
          {learnerMeta.jobTitle && <span className="text-muted"> · {learnerMeta.jobTitle}</span>}
          {learnerMeta.company && <span className="text-muted"> · {learnerMeta.company}</span>}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPracticeOpen(true)}
            className="text-sm font-medium text-white bg-accent hover:bg-accent/90 px-3 py-1.5 rounded-md"
          >
            AI Practice
          </button>
          <SessionTimer />
          <span className="text-sm text-muted tabular-nums">
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar slides={slides} activeIndex={currentSlideIndex} onSelect={goToSlide} curriculumTitle={curriculumTitle} />
        <SlideCanvas slide={activeSlide} learnerFirstName={learnerFirstName} />
      </div>

      {practiceOpen && (
        <AIPracticePanel
          sessionId={sessionId}
          onClose={() => setPracticeOpen(false)}
        />
      )}
    </div>
  );
}
