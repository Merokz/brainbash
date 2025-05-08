import { PrismaClient, Prisma, Quiz } from "@prisma/client"; // Import Prisma and Quiz
import { cacheExtension, cacheClient } from "./cache";
import { saveBase64Image } from "./save-image";

export * from "./db";

// Cache settings
const CACHE_TTL = 60; // 60 seconds TTL for most queries
const CACHE_SWR = 300; // 5 minutes SWR
const USER_CACHE_TTL = 300; // 5 minutes for user-related queries

// User functions

// Quiz functions

// Participant functions

// Game functions

// New function to start a question

// New function to end a question

// Quiz management functions
export async function findQuizById(quizId: number) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
  });
}

export async function invalidateAnswersForQuestion(questionId: number) {
  return prisma.answer.updateMany({
    where: { questionId },
    data: { valid: false },
  });
}
