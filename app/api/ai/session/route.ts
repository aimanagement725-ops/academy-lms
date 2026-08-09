import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionPlanId } = await req.json();

  const sessionPlan = await prisma.sessionPlan.findUnique({
    where: { id: sessionPlanId },
    include: { curriculumComponent: true, learner: true },
  });

  if (!sessionPlan) {
    return NextResponse.json({ error: "Session plan not found" }, { status: 404 });
  }

  const seedPrompt =
    sessionPlan.curriculumComponent.aiPracticePrompt ??
    `You are a friendly English conversation partner for a ${sessionPlan.curriculumComponent.cefrLevel} learner. Practice the topic "${sessionPlan.curriculumComponent.title}" with them, correct mistakes gently, and keep your own English simple.`;

  const aiSession = await prisma.aIConversationSession.create({
    data: {
      learnerId: sessionPlan.learnerId,
      seedPromptUsed: seedPrompt,
    },
  });

  return NextResponse.json({ aiSessionId: aiSession.id });
}
