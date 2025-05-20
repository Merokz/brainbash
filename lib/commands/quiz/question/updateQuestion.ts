export const updateQuestion = async (
    questionId: number,
    data: {
        questionText: string;
        image?: string;
        orderNum: number;
        questionType: string;
        valid: boolean;
    },
): Promise<any> => {
    return prisma.question.update({
        where: { id: questionId },
        data,
    });
};
