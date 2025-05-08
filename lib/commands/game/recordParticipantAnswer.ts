export async function recordParticipantAnswer(
  participantId: number,
  questionId: number,
  answerId: number | null,
  timeToAnswer: number,
  points: number = 0 // Default to 0 if not provided
) {
  return prisma.participantAnswer.create({
    data: {
      participantId,
      questionId,
      answerId,
      timeToAnswer,
      points,
    },
  });
}
