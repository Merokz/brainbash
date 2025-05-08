export async function updateAnswer(
    answerId: number,
    data: {
        answerText: string;
        isCorrect: boolean;
        valid: boolean;
    },
) {
    return prisma.answer.update({
        where: { id: answerId },
        data,
    });
}
