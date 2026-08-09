import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("changeme123", 10);

  // --- 1. Instructor User ---
  const instructorUser = await prisma.user.upsert({
    where: { email: "instructor@academy.test" },
    update: {},
    create: {
      email: "instructor@academy.test",
      hashedPassword,
      role: "INSTRUCTOR",
      firstName: "Assim",
      lastName: "Hany",
      instructorProfile: {
        create: { bio: "English instructor, corporate & adult learners." },
      },
    },
    include: { instructorProfile: true },
  });

  // Fallback to fetch or create profile if user previously existed without one
  let instructorProfileId = instructorUser.instructorProfile?.id;
  if (!instructorProfileId) {
    const profile = await prisma.instructorProfile.create({
      data: {
        userId: instructorUser.id,
        bio: "English instructor, corporate & adult learners.",
      },
    });
    instructorProfileId = profile.id;
  }

  // --- 2. Student User ---
  const studentUser = await prisma.user.upsert({
    where: { email: "learner@academy.test" },
    update: {},
    create: {
      email: "learner@academy.test",
      hashedPassword,
      role: "STUDENT",
      firstName: "Sara",
      lastName: "Youssef",
      learnerProfile: {
        create: {
          jobTitle: "Marketing Lead",
          industry: "Marketing",
          company: "Nile Retail Group",
          academyLevel: 3,
          cefrLevel: "B1.2",
          levelName: "Intermediate",
          instructorId: instructorProfileId,
        },
      },
    },
    include: { learnerProfile: true },
  });

  // Fallback to fetch or create profile if user previously existed without one
  let learnerProfileId = studentUser.learnerProfile?.id;
  if (!learnerProfileId) {
    const profile = await prisma.learnerProfile.create({
      data: {
        userId: studentUser.id,
        jobTitle: "Marketing Lead",
        industry: "Marketing",
        company: "Nile Retail Group",
        academyLevel: 3,
        cefrLevel: "B1.2",
        levelName: "Intermediate",
        instructorId: instructorProfileId,
      },
    });
    learnerProfileId = profile.id;
  }

  // --- 3. Curriculum Component ---
  let curriculum = await prisma.curriculumComponent.findFirst({
    where: { title: "Talk About Your To-Do List for the Week" },
  });

  if (!curriculum) {
    curriculum = await prisma.curriculumComponent.create({
      data: {
        title: "Talk About Your To-Do List for the Week",
        academyLevel: 3,
        cefrLevel: "B1.2",
        objectives: [
          'Use the Future Simple ("will") to state intent for the week',
          'Apply modals of necessity ("have to" / "don\'t have to") to prioritize tasks',
          "Master action-oriented work vocabulary (send email, report writing)",
          "Form questions to discuss weekly schedules and deadlines",
        ],
        warmUpPrompt:
          "Look at your to-do list. What is the most important thing you will finish before Friday?",
        grammarExplanation: {
          rule:
            'Use "will" for planned actions and "have to" for tasks that are mandatory because of a deadline.',
          examples: [
            "I will send an email to the team on Monday.",
            "I have to finish the status report by Tuesday.",
            "I don't have to attend the work dinner, but it is a good idea.",
          ],
        },
        vocabulary: [
          {
            group: "Communication",
            terms: [
              { term: "send email", definition: "to transmit a digital message" },
              { term: "meet with client", definition: "to have a professional discussion with a customer" },
            ],
          },
          {
            group: "Management",
            terms: [
              { term: "deadline", definition: "the time or date when a task must be finished" },
              { term: "priority", definition: "the most important task on your list" },
            ],
          },
        ],
        qaDrill: [
          { question: "Who will you contact regarding the new project?", answer: "I will send an email to the lead developer on Monday." },
          { question: "Do you have to finish the report writing today?", answer: "No, I don't have to finish it today, but the deadline is Thursday." },
        ],
        finalPresentation: {
          instructions: "Prepare a short update (5–6 sentences) about your plan for the upcoming week.",
          requirements: [
            'At least two sentences using "will" and one using "have to"',
            "At least four vocabulary items",
            "Mention meeting with a client or a work dinner",
          ],
          modelExample:
            "I have a very busy week ahead. My first priority is the new project...",
        },
        aiPracticePrompt:
          "You are a supportive English conversation partner for a B1 learner. Ask them about their to-do list for the week, prompting them to use 'will' for plans and 'have to' for deadlines. Correct mistakes gently and keep your own English at B1 level.",
        slides: {
          create: [
            { order: 1, slideType: "OBJECTIVES", title: "Today's Objectives", bodyRichText: {} },
            { order: 2, slideType: "WARMUP", title: "Warm-up", subtitleTemplate: "Hi, {{firstName}}!", bodyRichText: {}, instructionLabel: "INSTRUCTIONS", instructionDurationMin: 2, instructionText: "Look at your to-do list and share your top priority for the week." },
            { order: 3, slideType: "EXPLANATION", title: "Grammar: Will vs. Have to", bodyRichText: {} },
            { order: 4, slideType: "VOCABULARY", title: "Key Vocabulary", bodyRichText: {} },
            { order: 5, slideType: "QA_DRILL", title: "Practice Questions", bodyRichText: {} },
            { order: 6, slideType: "FINAL_PRESENTATION", title: "Your Weekly Update", bodyRichText: {}, instructionLabel: "INSTRUCTIONS", instructionDurationMin: 3, instructionText: "Give your 5-6 sentence weekly update using the target grammar." },
            { order: 7, slideType: "AI_PRACTICE", title: "Practice with your AI partner", bodyRichText: {} },
          ],
        },
      },
    });
  }

  // --- 4. Session Plan ---
  const existingSession = await prisma.sessionPlan.findFirst({
    where: {
      learnerId: learnerProfileId,
      curriculumComponentId: curriculum.id,
    },
  });

  if (!existingSession) {
    await prisma.sessionPlan.create({
      data: {
        dateScheduled: new Date(),
        status: "PENDING",
        learnerId: learnerProfileId,
        curriculumComponentId: curriculum.id,
        instructorId: instructorUser.id,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());