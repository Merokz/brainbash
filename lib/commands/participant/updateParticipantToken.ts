export async function updateParticipantToken(
    participantId: number,
    sessionToken: string,
) {
    return prisma.participant.update({
        where: { id: participantId },
        data: { sessionToken },
    });
}
