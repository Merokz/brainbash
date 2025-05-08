export async function createQuestion(
    quizId: number,
    data: {
        questionText: string;
        image?: string;
        orderNum: number;
        questionType: string;
    },
) {
    return prisma.question.create({
        data: {
            quizId,
            ...data,
        },
    });
}
