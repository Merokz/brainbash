export async function endQuestion(lobbyId: number) {
  return prisma.lobby.update({
    where: { id: lobbyId },
    data: {
      questionStartedAt: null,
    },
  });
}
