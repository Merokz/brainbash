export const endQuestion = async (lobbyId: number): Promise<any> => {
    return prisma.lobby.update({
        where: { id: lobbyId },
        data: {
            questionStartedAt: null,
        },
    });
};
