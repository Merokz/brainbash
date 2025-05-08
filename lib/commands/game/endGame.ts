export async function endGame(lobbyId: number) {
  return prisma.lobby.update({
    where: { id: lobbyId },
    data: { state: "CONCLUDED" },
  });
}
