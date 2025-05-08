export async function updateQuestion(
    questionId: number,
    data: {
        questionText: string;
        image?: string;
        orderNum: number;
        questionType: string;
        valid: boolean;
    },
) {
    return prisma.question.update({
        where: { id: questionId },
        data,
    });
}
