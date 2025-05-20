export const addParticipantToLobby = async (
    lobbyId: number,
    username: string,
    userId?: number,
): Promise<any> => {
    return prisma.participant.create({
        data: {
            lobbyId,
            username,
            userId,
            sessionToken: '', // This will be updated after creation
        },
    });
};
