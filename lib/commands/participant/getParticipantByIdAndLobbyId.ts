export async function getParticipantByIdAndLobbyId(
    participantId: number,
    lobbyId: number,
) {
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
}
