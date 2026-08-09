import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface LearnerPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function LearnerDetailPage({ params }: LearnerPageProps) {
  // Await params to ensure compatibility across Next.js versions
  const resolvedParams = await params;
  const learnerId = resolvedParams.id;

  // Fetch the record from PostgreSQL via Prisma
  const learner = await prisma.user.findUnique({
    where: {
      id: learnerId,
    },
    // Include related tables here if needed (e.g., include: { enrollments: true })
  });

  // If no record matches the ID in the database, trigger Next.js 404 page
  if (!learner) {
    notFound();
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>
          {learner.role || "LEARNER"} PROFILE
        </span>
        <h1 style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
  {`${learner.firstName} ${learner.lastName}`.trim() || "Unnamed Learner"}
</h1>
        <p style={{ color: "#555", margin: 0 }}>{learner.email}</p>
      </div>

      <hr style={{ borderColor: "#eee", margin: "1.5rem 0" }} />

      <div style={{ display: "grid", gap: "1rem", backgroundColor: "#f9f9f9", padding: "1.5rem", borderRadius: "8px" }}>
        <div>
          <strong>Database ID:</strong> <code style={{ background: "#eef", padding: "2px 6px", borderRadius: "4px" }}>{learner.id}</code>
        </div>
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