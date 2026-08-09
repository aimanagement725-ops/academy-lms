import Link from "next/link";
import type { LearnerProfile, User } from "@prisma/client";

type LearnerWithUser = LearnerProfile & { user: User };

export default function LearnerCard({ learner }: { learner: LearnerWithUser }) {
  const progressPct =
    learner.totalSessions > 0
      ? Math.round((learner.totalSessions / (learner.totalSessions + 20)) * 100) // placeholder until a real target field exists
      : 0;

  return (
    <Link
      href={`/learners/${learner.id}`}
      className="block bg-surface border border-line rounded-card shadow-card p-5 hover:border-accent/40 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-display text-lg text-ink">
            {learner.user.firstName} {learner.user.lastName}
          </h2>
          <p className="text-sm text-muted">{learner.jobTitle ?? "—"}</p>
        </div>
        <span className="text-xs font-medium bg-accent-soft text-accent px-2 py-1 rounded-full">
          {learner.cefrLevel}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{learner.totalSessions} sessions completed</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </Link>
  );
}
