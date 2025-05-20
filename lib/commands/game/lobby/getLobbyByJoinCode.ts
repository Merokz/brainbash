export const getLobbyByJoinCode = (joinCode: string): Promise<any> => {
    return prisma.lobby.findUnique({
        where: {
            joinCode,
            valid: true,
        },
        include: {
            quiz: true,
            host: {
                select: {
                    username: true,
                },
            },
        },
    });
};
