import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface LearnerPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function LearnerDetailPage({ params }: LearnerPageProps) {
  const resolvedParams = await params;
  const learnerId = resolvedParams.id;

  // Search by User ID OR LearnerProfile ID so links never brokenly 404
  const learner = await prisma.user.findFirst({
    where: {
      OR: [
        { id: learnerId },
        { learnerProfile: { id: learnerId } },
      ],
    },
    include: {
      learnerProfile: true,
    },
  });

  // Trigger 404 page if no user or profile matches
  if (!learner) {
    notFound();
  }

  const profile = learner.learnerProfile;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>
          {learner.role || "LEARNER"} PROFILE
        </span>
        <h1 style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
          {`${learner.firstName ?? ""} ${learner.lastName ?? ""}`.trim() || "Unnamed Learner"}
        </h1>
        <p style={{ color: "#555", margin: 0 }}>{learner.email}</p>
      </div>

      <hr style={{ borderColor: "#eee", margin: "1.5rem 0" }} />

      <div style={{ display: "grid", gap: "1rem", backgroundColor: "#f9f9f9", padding: "1.5rem", borderRadius: "8px" }}>
        <div>
          <strong>User ID:</strong> <code style={{ background: "#eef", padding: "2px 6px", borderRadius: "4px" }}>{learner.id}</code>
        </div>
        {profile && (
          <>
            <div>
              <strong>Job Title:</strong> {profile.jobTitle || "N/A"}
            </div>
            <div>
              <strong>Company:</strong> {profile.company || "N/A"}
            </div>
            <div>
              <strong>CEFR Level:</strong> {profile.cefrLevel} ({profile.levelName})
            </div>
          </>
        )}
        <div>
          <strong>Role:</strong> {learner.role}
        </div>
        <div>
          <strong>Account Created:</strong> {new Date(learner.createdAt).toLocaleDateString()}
        </div>
      </div>
    </main>
  );
}