export const createQuestion = (
    quizId: number,
    data: {
        questionText: string;
        image?: string;
        orderNum: number;
        questionType: string;
    },
): Promise<any> => {
    return prisma.question.create({
        data: {
            quizId,
            ...data,
        },
    });
};
