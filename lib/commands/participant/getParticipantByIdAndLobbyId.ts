export const getParticipantByIdAndLobbyId = async (
    participantId: number,
    lobbyId: number,
): Promise<any> => {
    return prisma.participant.findUnique({
        where: {
            id: participantId,
            lobbyId: lobbyId,
            valid: true,
        },
        include: {
            lobby: true,
        },
    });
};
