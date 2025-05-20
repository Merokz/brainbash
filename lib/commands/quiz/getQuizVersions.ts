export const getQuizVersions = async (rootQuizId: number): Promise<any> => {
    // Find all versions of a quiz
    return prisma.quiz.findMany({
        where: {
            OR: [{ id: rootQuizId }, { parentQuizId: rootQuizId }],
            valid: true,
        },
        orderBy: {
            version: 'desc',
        },
        select: {
            id: true,
            title: true,
            version: true,
            createdAt: true,
        },
    });
};
