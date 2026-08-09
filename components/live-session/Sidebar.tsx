import type { Slide } from "@prisma/client";
import { clsx } from "clsx";

const PHASE_LABELS: Record<string, string> = {
  OBJECTIVES: "Objectives",
  WARMUP: "Warm-up",
  EXPLANATION: "Explanation",
  VOCABULARY: "Vocabulary",
  QA_DRILL: "Q&A Drill",
  FINAL_PRESENTATION: "Final Presentation",
  AI_PRACTICE: "AI Practice",
  INSTRUCTION_BREAK: "Instructions",
};

export default function Sidebar({
  slides,
  activeIndex,
  onSelect,
  curriculumTitle,
}: {
  slides: Slide[];
  activeIndex: number;
  onSelect: (i: number) => void;
  curriculumTitle: string;
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-line bg-surface py-6 px-4 overflow-y-auto">
      <p className="text-xs uppercase tracking-wide text-muted mb-4 px-2">{curriculumTitle}</p>
      <nav className="space-y-1">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => onSelect(i)}
            className={clsx(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              i === activeIndex
                ? "bg-accent-soft text-accent font-medium"
                : "text-ink hover:bg-canvas"
            )}
          >
            <span className="block text-[11px] uppercase tracking-wide text-muted mb-0.5">
              {PHASE_LABELS[slide.slideType] ?? slide.slideType}
            </span>
            {slide.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}
