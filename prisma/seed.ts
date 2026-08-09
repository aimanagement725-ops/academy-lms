import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Users ---
  const instructorUser = await prisma.user.create({
    data: {
      email: "instructor@academy.test",
      hashedPassword: await bcrypt.hash("changeme123", 10),
      role: "INSTRUCTOR",
      firstName: "Assim",
      lastName: "Hany",
      instructorProfile: { create: { bio: "English instructor, corporate & adult learners." } },
    },
    include: { instructorProfile: true },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "learner@academy.test",
      hashedPassword: await bcrypt.hash("changeme123", 10),
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
          instructorId: instructorUser.instructorProfile!.id,
        },
      },
    },
    include: { learnerProfile: true },
  });

  // --- Curriculum: adapted from the academy's real lesson doc ---
  const curriculum = await prisma.curriculumComponent.create({
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

  await prisma.sessionPlan.create({
    data: {
      dateScheduled: new Date(),
      status: "PENDING",
      learnerId: studentUser.learnerProfile!.id,
      curriculumComponentId: curriculum.id,
      instructorId: instructorUser.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
