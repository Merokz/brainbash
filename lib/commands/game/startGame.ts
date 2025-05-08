export async function startGame(lobbyId: number) {
    // fetch lobby and its quiz, questions, and answers
    const lobby = await prisma.lobby.findUnique({
        where: { id: lobbyId },
        include: {
            quiz: {
                include: {
                    questions: { include: { answers: true } },
                },
            },
        },
    });
    if (!lobby) {
        throw new Error(`Lobby ${lobbyId} not found`);
    }
    const original = lobby.quiz;

    // determine root quiz for versioning
    const rootQuizId = original.parentQuizId ?? original.id;
    // create a versioned clone of the quiz, questions, and answers
    const cloned = await prisma.quiz.create({
        data: {
            title: original.title,
            description: original.description,
            creatorId: original.creatorId,
            isPublic: original.isPublic,
            valid: true,
            version: original.version + 1,
            parentQuizId: rootQuizId,
            questions: {
                create: (original.questions as any[]).map((q: any) => ({
                    questionText: q.questionText,
                    image: q.image,
                    orderNum: q.orderNum,
                    questionType: q.questionType,
                    valid: q.valid,
                    answers: {
                        create: (q.answers as any[]).map((a: any) => ({
                            answerText: a.answerText,
                            isCorrect: a.isCorrect,
                            valid: a.valid,
                        })),
                    },
                })),
            },
        },
    });
    // update lobby to use the cloned quiz version
    return prisma.lobby.update({
        where: { id: lobbyId },
        data: {
            state: 'IN_GAME',
            // Initialize game state fields
            currentQuestionIdx: -1,
            questionStartedAt: null,
        },
    });
}
