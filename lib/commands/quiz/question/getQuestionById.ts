export async function getQuestionById(questionId: number) {
  return prisma.question.findUnique({
    where: { id: questionId },
    include: {
      answers: true,
    },
  });
}