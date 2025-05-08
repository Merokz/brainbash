export async function createAnswer(
    questionId: number,
    data: {
        answerText: string;
        isCorrect: boolean;
    },
) {
    return prisma.answer.create({
        data: {
            questionId,
            ...data,
        },
    });
}
