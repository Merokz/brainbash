export async function getQuizVersions(rootQuizId: number) {
  // Find all versions of a quiz
  return prisma.quiz.findMany({
    where: {
      OR: [{ id: rootQuizId }, { parentQuizId: rootQuizId }],
      valid: true,
    },
    orderBy: {
      version: "desc",
    },
    select: {
      id: true,
      title: true,
      version: true,
      createdAt: true,
    },
  });
}
