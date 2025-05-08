export async function startQuestion(lobbyId: number, questionIndex: number) {
  return prisma.lobby.update({
    where: { id: lobbyId },
    data: {
      currentQuestionIdx: questionIndex,
      questionStartedAt: new Date(), // Server timestamp
    },
  });
}
