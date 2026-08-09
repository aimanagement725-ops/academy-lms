import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LearnerCard from "@/components/dashboard/LearnerCard";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const learners = await prisma.learnerProfile.findMany({
    where:
      role === "ADMIN"
        ? {}
        : { instructor: { userId: userId } },
    include: { user: true },
    orderBy: { user: { lastName: "asc" } },
  });

  return (
    <main className="min-h-screen bg-canvas px-8 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-ink">Your learners</h1>
        <p className="text-muted text-sm mt-1">{learners.length} active learners</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {learners.map((learner) => (
          <LearnerCard key={learner.id} learner={learner} />
        ))}
      </div>
    </main>
  );
}
