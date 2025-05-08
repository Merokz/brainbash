export async function softDeleteQuiz(quizId: number) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: { valid: false },
  });
}
