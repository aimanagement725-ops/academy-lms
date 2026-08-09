-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "SlideType" AS ENUM ('OBJECTIVES', 'WARMUP', 'EXPLANATION', 'VOCABULARY', 'QA_DRILL', 'FINAL_PRESENTATION', 'AI_PRACTICE', 'INSTRUCTION_BREAK');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AISessionStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "InstructorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "industry" TEXT,
    "company" TEXT,
    "academyLevel" INTEGER NOT NULL,
    "cefrLevel" TEXT NOT NULL,
    "levelName" TEXT NOT NULL,
    "instructorId" TEXT,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "sessionsPerWeek" INTEGER NOT NULL DEFAULT 2,
    "avgRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumComponent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "academyLevel" INTEGER NOT NULL,
    "cefrLevel" TEXT NOT NULL,
    "objectives" TEXT[],
    "warmUpPrompt" TEXT NOT NULL,
    "grammarExplanation" JSONB NOT NULL,
    "vocabulary" JSONB NOT NULL,
    "qaDrill" JSONB NOT NULL,
    "finalPresentation" JSONB NOT NULL,
    "aiPracticePrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "slideType" "SlideType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitleTemplate" TEXT,
    "bodyRichText" JSONB,
    "instructionLabel" TEXT,
    "instructionDurationMin" INTEGER,
    "instructionText" TEXT,
    "curriculumComponentId" TEXT NOT NULL,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionPlan" (
    "id" TEXT NOT NULL,
    "dateScheduled" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "learnerId" TEXT NOT NULL,
    "curriculumComponentId" TEXT NOT NULL,
    "instructorId" TEXT,
    "coachFeedback" TEXT,
    "completionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversationSession" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "seedPromptUsed" TEXT NOT NULL,
    "realtimeProvider" TEXT NOT NULL DEFAULT 'openai',
    "status" "AISessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "instructorNotes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "AIConversationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "correctionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_userId_key" ON "InstructorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_userId_key" ON "LearnerProfile"("userId");

-- CreateIndex
CREATE INDEX "Slide_curriculumComponentId_order_idx" ON "Slide"("curriculumComponentId", "order");

-- AddForeignKey
ALTER TABLE "InstructorProfile" ADD CONSTRAINT "InstructorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "InstructorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_curriculumComponentId_fkey" FOREIGN KEY ("curriculumComponentId") REFERENCES "CurriculumComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPlan" ADD CONSTRAINT "SessionPlan_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPlan" ADD CONSTRAINT "SessionPlan_curriculumComponentId_fkey" FOREIGN KEY ("curriculumComponentId") REFERENCES "CurriculumComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPlan" ADD CONSTRAINT "SessionPlan_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversationSession" ADD CONSTRAINT "AIConversationSession_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AIConversationSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
