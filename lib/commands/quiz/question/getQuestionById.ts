export const getQuestionById = async (questionId: number): Promise<any> => {
    return prisma.question.findUnique({
        where: { id: questionId },
        include: {
            answers: true,
        },
    });
};
