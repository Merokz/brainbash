export const startQuestion = async (
    lobbyId: number,
    questionIndex: number,
): Promise<any> => {
    return prisma.lobby.update({
        where: { id: lobbyId },
        data: {
            currentQuestionIdx: questionIndex,
            questionStartedAt: new Date(), // Server timestamp
        },
    });
};
