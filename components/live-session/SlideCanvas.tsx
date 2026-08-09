import type { Slide, CurriculumComponent } from "@prisma/client";

function interpolate(template: string | null, firstName: string) {
  if (!template) return null;
  return template.replaceAll("{{firstName}}", firstName);
}

type GrammarExplanation = { rule: string; examples: string[] };
type VocabGroup = { group: string; terms: { term: string; definition: string }[] };
type QADrillItem = { question: string; answer: string };
type FinalPresentation = { instructions: string; requirements: string[]; modelExample: string };

function SlideBody({
  slide,
  curriculumComponent,
}: {
  slide: Slide;
  curriculumComponent: CurriculumComponent;
}) {
  switch (slide.slideType) {
    case "OBJECTIVES": {
      const objectives = curriculumComponent.objectives as string[];
      return (
        <ul className="mt-6 space-y-2 list-disc list-inside text-ink text-[15px]">
          {objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      );
    }

    case "WARMUP":
      return (
        <p className="mt-6 text-ink text-[15px] leading-relaxed">
          {curriculumComponent.warmUpPrompt}
        </p>
      );

    case "EXPLANATION": {
      const grammar = curriculumComponent.grammarExplanation as unknown as GrammarExplanation;
      return (
        <div className="mt-6 space-y-4">
          <p className="text-ink text-[15px] leading-relaxed">{grammar.rule}</p>
          <ul className="space-y-1.5 list-disc list-inside text-muted text-sm">
            {grammar.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        </div>
      );
    }

    case "VOCABULARY": {
      const groups = curriculumComponent.vocabulary as unknown as VocabGroup[];
      return (
        <div className="mt-6 space-y-6">
          {groups.map((g) => (
            <div key={g.group}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                {g.group}
              </p>
              <dl className="space-y-1.5">
                {g.terms.map((t) => (
                  <div key={t.term} className="flex gap-2 text-[15px]">
                    <dt className="font-medium text-ink">{t.term}</dt>
                    <dd className="text-muted">— {t.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      );
    }

    case "QA_DRILL": {
      const drills = curriculumComponent.qaDrill as unknown as QADrillItem[];
      return (
        <div className="mt-6 space-y-5">
          {drills.map((d, i) => (
            <div key={i}>
              <p className="text-ink text-[15px] font-medium">Q: {d.question}</p>
              <p className="text-muted text-sm mt-1">A: {d.answer}</p>
            </div>
          ))}
        </div>
      );
    }

    case "FINAL_PRESENTATION": {
      const fp = curriculumComponent.finalPresentation as unknown as FinalPresentation;
      return (
        <div className="mt-6 space-y-4">
          <p className="text-ink text-[15px] leading-relaxed">{fp.instructions}</p>
          <ul className="space-y-1.5 list-disc list-inside text-muted text-sm">
            {fp.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="bg-canvas border border-line rounded-md p-4 text-sm text-muted italic">
            {fp.modelExample}
          </div>
        </div>
      );
    }

    case "AI_PRACTICE":
      return (
        <p className="mt-6 text-ink text-[15px] leading-relaxed">
          Click <span className="font-medium text-accent">AI Practice</span> in the top bar to
          start a live conversation and put today&apos;s grammar and vocabulary to work.
        </p>
      );

    default:
      return null;
  }
}

export default function SlideCanvas({
  slide,
  learnerFirstName,
  curriculumComponent,
}: {
  slide: Slide | undefined;
  learnerFirstName: string;
  curriculumComponent: CurriculumComponent;
}) {
  if (!slide) {
    return (
      <main className="flex-1 flex items-center justify-center text-muted text-sm">
        No slides yet for this session.
      </main>
    );
  }

  const subtitle = interpolate(slide.subtitleTemplate, learnerFirstName);

  return (
    <main className="flex-1 px-12 py-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-surface border border-line rounded-card shadow-card p-10">
        <h1 className="font-display text-3xl text-ink mb-1">
          {slide.title} {subtitle && <span className="text-accent">{subtitle}</span>}
        </h1>

        <SlideBody slide={slide} curriculumComponent={curriculumComponent} />

        {slide.instructionText && (
          <div className="mt-8 bg-signal-amber/10 border border-signal-amber/30 rounded-md p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-signal-amber mb-1">
              {slide.instructionLabel ?? "Instructions"}
              {slide.instructionDurationMin ? ` · ${slide.instructionDurationMin} min` : ""}
            </p>
            <p className="text-sm text-ink">{slide.instructionText}</p>
          </div>
        )}
      </div>
    </main>
  );
}