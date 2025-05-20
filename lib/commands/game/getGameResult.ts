export const getGameResults = async (lobbyId: number): Promise<any> => {
    const participants = await prisma.participant.findMany({
        where: { lobbyId, valid: true },
        include: {
            participantAnswers: {
                include: {
                    question: true,
                    answer: true,
                },
            },
        },
        orderBy: { score: 'desc' },
    });

    return participants;
};
