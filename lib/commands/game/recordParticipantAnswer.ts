export async function recordParticipantAnswer(
  participantId: number,
  questionId: number,
  answerId: number | null,
  timeToAnswer: number,
) {
  return prisma.participantAnswer.create({
    data: {
      participantId,
      questionId,
      answerId,
      timeToAnswer,
    },
  });
}
