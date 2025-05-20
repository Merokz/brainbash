export const createLobby = async (
    quizId: number,
    hostId: number,
    // isPublic: boolean,
): Promise<any> => {
    // Generate a unique 5-digit join code
    let joinCode = '00000';
    let isUnique = false;

    while (!isUnique) {
        joinCode = Math.floor(10000 + Math.random() * 90000).toString();
        const existingLobby = await prisma.lobby.findUnique({
            where: { joinCode },
        });
        isUnique = !existingLobby;
    }

    return prisma.lobby.create({
        data: {
            quizId,
            hostId,
            joinCode,
            state: 'IN_LOBBY',
        },
    });
};
