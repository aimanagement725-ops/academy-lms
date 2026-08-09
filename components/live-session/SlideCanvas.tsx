import type { Slide } from "@prisma/client";

function interpolate(template: string | null, firstName: string) {
  if (!template) return null;
  return template.replaceAll("{{firstName}}", firstName);
}

export default function SlideCanvas({
  slide,
  learnerFirstName,
}: {
  slide: Slide | undefined;
  learnerFirstName: string;
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

        {/* bodyRichText is a flexible JSON block whose shape depends on slideType --
            render via a small dispatcher per type in a fuller build */}
        {slide.bodyRichText != null && (
          <div className="mt-6 text-ink text-[15px] leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(slide.bodyRichText, null, 2)}
          </div>
        )}

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
