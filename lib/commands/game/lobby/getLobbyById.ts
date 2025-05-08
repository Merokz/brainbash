export async function getLobbyById(lobbyId: number) {
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
            orderBy: { orderNum: "asc" },
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
}
