export const updateAnswer = async (
    answerId: number,
    data: {
        answerText: string;
        isCorrect: boolean;
        valid: boolean;
    },
): Promise<any> => {
    return prisma.answer.update({
        where: { id: answerId },
        data,
    });
};
