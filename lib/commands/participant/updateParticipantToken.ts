export const updateParticipantToken = (
    participantId: number,
    sessionToken: string,
): Promise<any> => {
    return prisma.participant.update({
        where: { id: participantId },
        data: { sessionToken },
    });
};
