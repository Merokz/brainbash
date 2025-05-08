export async function getLobbyByJoinCode(joinCode: string) {
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
}
