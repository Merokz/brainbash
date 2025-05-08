import { cacheClient } from "@/lib/cache";
import { Prisma } from "@prisma/client";

type QuizWithQuestionCount = Prisma.QuizGetPayload<{
  include: {
    _count: {
      select: {
        questions: true;
      };
    };
  };
}>;

export async function getUserQuizzes(
  userId: number
): Promise<QuizWithQuestionCount[]> {
  const cacheKey = `User:${userId}:quizzes`;
  // Use the specific user cache TTL
  return cacheClient.get<QuizWithQuestionCount[]>(
    cacheKey,
    () =>
      prisma.quiz.findMany({
        where: {
          creatorId: userId,
          valid: true,
        },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
      }),
    USER_CACHE_TTL // Pass the specific TTL here
  );
}
