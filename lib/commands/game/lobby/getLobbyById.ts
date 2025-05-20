export const getLobbyById = async (lobbyId: number): Promise<any> => {
    return prisma.lobby.findUnique({
        where: {
            id: lobbyId,
            valid: true,
        },
        include: {
            quiz: {
                include: {
                    questions: {
                        where: { valid: true },
                        orderBy: { orderNum: 'asc' },
                        include: {
                            answers: {
                                where: { valid: true },
                            },
                        },
                    },
                },
            },
            host: {
                select: {
                    username: true,
                },
            },
            participants: {
                where: { valid: true },
            },
        },
    });
};
