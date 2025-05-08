export async function getPublicQuizzes() {
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
}
