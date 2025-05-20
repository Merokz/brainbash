export const createAnswer = async (
    questionId: number,
    data: {
        answerText: string;
        isCorrect: boolean;
    },
): Promise<any> => {
    return prisma.answer.create({
        data: {
            questionId,
            ...data,
        },
    });
};
