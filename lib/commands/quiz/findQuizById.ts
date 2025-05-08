export async function findQuizById(quizId: number) {
    return prisma.quiz.findUnique({
        where: { id: quizId },
    });
}
