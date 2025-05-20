export const findQuizById = async (quizId: number): Promise<any> => {
    return prisma.quiz.findUnique({
        where: { id: quizId },
    });
};
