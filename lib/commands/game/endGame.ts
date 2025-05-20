export const endGame = async (lobbyId: number): Promise<any> => {
    return prisma.lobby.update({
        where: { id: lobbyId },
        data: { state: 'CONCLUDED' },
    });
};
