export const softDeleteQuiz = async (quizId: number): Promise<any> => {
    return prisma.quiz.update({
        where: { id: quizId },
        data: { valid: false },
    });
};
