export const createNewQuiz = async (
    creatorId: number,
    title: string,
    description: string,
    isPublic: boolean,
    version: number = 1,
): Promise<any> => {
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
};
