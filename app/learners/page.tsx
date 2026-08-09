import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Forces Next.js to fetch data on every request (SSR) instead of during build
export const dynamic = "force-dynamic";

export default async function LearnersListPage() {
  const learners = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { learnerProfile: true },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Learners Directory ({learners.length})</h1>

      {learners.length === 0 ? (
        <div style={{ padding: "1rem", backgroundColor: "#fff3cd", border: "1px solid #ffeeba", borderRadius: "6px" }}>
          <strong>⚠️ Database is empty!</strong> No student records were found.
        </div>
      ) : (
        <ul style={{ display: "grid", gap: "1rem", listStyle: "none", padding: 0 }}>
          {learners.map((learner) => (
            <li key={learner.id} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                {learner.firstName} {learner.lastName}
              </div>
              <div style={{ color: "#666", marginBottom: "0.5rem" }}>{learner.email}</div>
              <div style={{ fontSize: "0.85rem", color: "#888" }}>
                <strong>User ID:</strong> <code>{learner.id}</code>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <Link
                  href={`/learners/${learner.id}`}
                  style={{ color: "#0070f3", textDecoration: "underline", fontWeight: "bold" }}
                >
                  View Profile →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}