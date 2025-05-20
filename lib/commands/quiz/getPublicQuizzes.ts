export const getPublicQuizzes = async (): Promise<any> => {
    return prisma.quiz.findMany({
        where: {
            isPublic: true,
            valid: true,
        },
        include: {
            creator: {
                select: {
                    username: true,
                },
            },
            _count: {
                select: {
                    questions: true,
                },
            },
        },
    });
};
