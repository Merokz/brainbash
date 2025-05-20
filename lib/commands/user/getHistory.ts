type ParticipationWithLobbyAndQuiz = {
    score: number;
    lobby: {
        id: string;
        quiz_id: string;
        created_at: Date;
        host_id: string;
        quiz: {
            id: string;
            title: string;
            description: string;
            created_at: Date;
            // Add any other quiz fields you need
        };
        // Add other lobby fields as needed
    };
};

export const getHistory = async (userId: number): Promise<any> => {
    try {
        const participations: ParticipationWithLobbyAndQuiz[] =
            await prisma.participant.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    lobby: {
                        include: {
                            quiz: true,
                        },
                    },
                },
            });

        const history = participations
            .map((p) => ({
                score: p.score,
                lobby: p.lobby,
            }))
            .sort(
                (a, b) =>
                    b.lobby.created_at.getTime() - a.lobby.created_at.getTime(),
            );

        return history;
    } catch (error) {
        console.error('Failed to fetch participation history:', error);
        throw new Error('Could not retrieve participation history.');
    }
};
