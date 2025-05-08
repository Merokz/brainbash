export async function addParticipantToLobby(
  lobbyId: number,
  username: string,
  userId?: number
) {
  return prisma.participant.create({
    data: {
      lobbyId,
      username,
      userId,
      sessionToken: "", // This will be updated after creation
    },
  });
}
