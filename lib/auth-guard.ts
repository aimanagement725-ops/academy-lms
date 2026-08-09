// lib/auth-guard.ts
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireInstructor() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}