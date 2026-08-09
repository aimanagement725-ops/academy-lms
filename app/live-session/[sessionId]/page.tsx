// app/live-session/[sessionId]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PresentationShell from "@/components/live-session/PresentationShell";

export const dynamic = "force-dynamic";

export default async function LiveSessionPage({ params }: { params: { sessionId: string } }) {
  const allSessions = await prisma.sessionPlan.findMany({ select: { id: true, dateScheduled: true } });   // ← NEW
  console.log("[live-session] ALL sessionPlans in DB:", JSON.stringify(allSessions));                      // ← NEW

  console.log("[live-session] Looking up sessionId:", params.sessionId);

  const sessionPlan = await prisma.sessionPlan.findUnique({
    where: { id: params.sessionId },
    include: {
      learner: { include: { user: true } },
      curriculumComponent: { include: { slides: { orderBy: { order: "asc" } } } },
    },
  });

  console.log("[live-session] Result:", sessionPlan ? `FOUND (${sessionPlan.id})` : "NULL");

  if (!sessionPlan) notFound();

  return (
    <PresentationShell
      learnerFirstName={sessionPlan.learner.user.firstName}
      learnerMeta={{
        name: `${sessionPlan.learner.user.firstName} ${sessionPlan.learner.user.lastName}`,
        jobTitle: sessionPlan.learner.jobTitle,
        company: sessionPlan.learner.company,
      }}
      curriculumTitle={sessionPlan.curriculumComponent.title}
      slides={sessionPlan.curriculumComponent.slides}
      sessionId={sessionPlan.id}
    />
  );
}