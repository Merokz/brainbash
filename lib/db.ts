// User functions

// Quiz functions

// Participant functions

// Game functions

// New function to start a question

// New function to end a question

// Quiz management functions

export async function invalidateAnswersForQuestion(questionId: number) {
  return prisma.answer.updateMany({
    where: { questionId },
    data: { valid: false },
  });
}
