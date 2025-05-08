export async function createNewQuiz(
    creatorId: number,
    title: string,
    description: string,
    isPublic: boolean,
    version: number = 1,
) {
    return prisma.quiz.create({
        data: {
            title,
            description,
            creatorId,
            isPublic,
            version,
            valid: true,
        },
    });
}
