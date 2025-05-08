import { cacheClient } from '@/lib/cache';
import { Prisma } from '@prisma/client';

type QuizWithQuestions = Prisma.QuizGetPayload<{
    include: {
        questions: {
            where: { valid: true };
            orderBy: { orderNum: 'asc' };
            include: { answers: { where: { valid: true } } };
        };
    };
}>;

export async function getQuizById(
    quizId: number,
): Promise<QuizWithQuestions | null> {
    const cacheKey = `Quiz:${quizId}:full`;
    return cacheClient.get(cacheKey, () =>
        prisma.quiz.findUnique({
            where: { id: quizId, valid: true },
            include: {
                questions: {
                    where: { valid: true },
                    orderBy: { orderNum: 'asc' },
                    include: { answers: { where: { valid: true } } },
                },
            },
        }),
    );
}
