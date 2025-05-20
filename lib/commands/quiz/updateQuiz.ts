<<<<<<< HEAD
export const updateQuiz = (
    quizId: number,
    title: string,
    description: string,
    isPublic: boolean,
): Promise<any> => {
    return prisma.quiz.update({
        where: { id: quizId },
        data: {
            title,
            description,
            isPublic,
        },
    });
};
=======
export async function updateQuiz(
  quizId: number,
  title: string,
  description: string,
  isPublic: boolean
) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: {
      title,
      description,
      isPublic
    }
  })
}
>>>>>>> main
