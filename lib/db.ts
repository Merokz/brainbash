import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Connection pooling configuration
const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  return prisma;
};

export const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

if (process.env.NODE_ENV !== 'development') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Cache settings
const CACHE_TTL = 60; // 60 seconds TTL for most queries
const CACHE_SWR = 300; // 5 minutes SWR
const USER_CACHE_TTL = 300; // 5 minutes for user-related queries

// User functions
export async function findUserByCredentials(usernameOrEmail: string) {
  return prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
      valid: true,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
    },
  });
}

export async function findUserById(userId: number) {
  return prisma.user.findUnique({
    where: { 
      id: userId,
      valid: true,
    },
     select: {
      id: true,
      username: true,
      email: true,
      isRegistered: true,
    },
  });
}

export async function checkExistingUser(username: string, email: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
}

export async function createUser(username: string, email: string, password: string) {
  return prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });
}

// Quiz functions
export async function getPublicQuizzes() {
  return prisma.quiz.findMany({
    where: {
      isPublic: true,
      valid: true,
    },
    include: {
      creator: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  })
}

export async function getUserQuizzes(userId: number) {
  return prisma.quiz.findMany({
    where: {
      creatorId: userId,
      valid: true,
    },
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
  })
}

export async function getQuizById(quizId: number) {
  return prisma.quiz.findUnique({
    where: {
      id: quizId,
      valid: true,
    },
    include: {
      questions: {
        where: {
          valid: true,
        },
        orderBy: {
          orderNum: "asc",
        },
        include: {
          answers: {
            where: {
              valid: true,
            },
          },
        },
      },
    },
  })
}

// Lobby functions
export async function getPublicLobbies() {
  return prisma.lobby.findMany({
    where: {
      quiz: {
        isPublic: true,
      },
      state: "IN_LOBBY",
      valid: true,
    },
    include: {
      quiz: {
        select: {
          title: true,
        },
      },
      host: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  })
}

export async function getLobbyByJoinCode(joinCode: string) {
  return prisma.lobby.findUnique({
    where: {
      joinCode,
      valid: true,
    },
    include: {
      quiz: true,
      host: {
        select: {
          username: true,
        },
      },
    },
  })
}

export async function getLobbyById(lobbyId: number) {
  return prisma.lobby.findUnique({
    where: {
      id: lobbyId,
      valid: true,
    },
    include: {
      quiz: {
        include: {
          questions: {
            where: { valid: true },
            orderBy: { orderNum: "asc" },
            include: {
              answers: {
                where: { valid: true },
              },
            },
          },
        },
      },
      host: {
        select: {
          username: true,
        },
      },
      participants: {
        where: { valid: true }
      }
    },
  })
}

export async function createLobby(quizId: number, hostId: number, isPublic: boolean) {
  // Generate a unique 5-digit join code
  let joinCode = "00000"
  let isUnique = false

  while (!isUnique) {
    joinCode = Math.floor(10000 + Math.random() * 90000).toString()
    const existingLobby = await prisma.lobby.findUnique({
      where: { joinCode },
    })
    isUnique = !existingLobby
  }

  return prisma.lobby.create({
    data: {
      quizId,
      hostId,
      joinCode,
      state: "IN_LOBBY",
    },
  })
}

// Participant functions
export async function addParticipantToLobby(lobbyId: number, username: string, userId?: number) {
  return prisma.participant.create({
    data: {
      lobbyId,
      username,
      userId,
      sessionToken: "", // This will be updated after creation
    },
  })
}

export async function updateParticipantToken(participantId: number, sessionToken: string) {
  return prisma.participant.update({
    where: { id: participantId },
    data: { sessionToken },
  })
}

export async function getParticipantByIdAndLobbyId(participantId: number, lobbyId: number) {
    return prisma.participant.findUnique({
      where: {
        id: participantId,
        lobbyId: lobbyId,
        valid: true,
      },
      include: {
        lobby: true,
      },
    });
  }

// Game functions
export async function startGame(lobbyId: number) {
  // fetch lobby and its quiz, questions, and answers
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      quiz: {
        include: {
          questions: { include: { answers: true } }
        }
      }
    }
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
        create: original.questions.map(q => ({
          questionText: q.questionText,
          image: q.image,
          orderNum: q.orderNum,
          questionType: q.questionType,
          valid: q.valid,
          answers: {
            create: q.answers.map(a => ({
              answerText: a.answerText,
              isCorrect: a.isCorrect,
              valid: a.valid,
            }))
          }
        }))
      }
    }
  });
  // update lobby to use the cloned quiz version
  return prisma.lobby.update({
    where: { id: lobbyId },
    data: {
      state: "IN_GAME",
      quizId: cloned.id,
    },
  });
}

export async function endGame(lobbyId: number) {
  return prisma.lobby.update({
    where: { id: lobbyId },
    data: { state: "CONCLUDED" },
  })
}

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
  })
}

export async function getGameResults(lobbyId: number) {
  const participants = await prisma.participant.findMany({
    where: { lobbyId, valid: true },
    include: {
      participantAnswers: {
        include: {
          question: true,
          answer: true,
        },
      },
    },
    orderBy: { score: "desc" },
  })

  return participants
}

// Quiz management functions
export async function findQuizById(quizId: number) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
  });
}

export async function updateQuiz(quizId: number, title: string, description: string, isPublic: boolean) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: {
      title,
      description,
      isPublic,
    },
  });
}

export async function invalidateQuestionsForQuiz(quizId: number) {
  return prisma.question.updateMany({
    where: { quizId },
    data: { valid: false },
  });
}

export async function updateQuestion(questionId: number, data: { 
  questionText: string, 
  image?: string, 
  orderNum: number, 
  questionType: string,
  valid: boolean
}) {
  return prisma.question.update({
    where: { id: questionId },
    data,
  });
}

export async function createQuestion(quizId: number, data: { 
  questionText: string, 
  image?: string, 
  orderNum: number, 
  questionType: string 
}) {
  return prisma.question.create({
    data: {
      quizId,
      ...data,
    },
  });
}

export async function invalidateAnswersForQuestion(questionId: number) {
  return prisma.answer.updateMany({
    where: { questionId },
    data: { valid: false },
  });
}

export async function updateAnswer(answerId: number, data: {
  answerText: string,
  isCorrect: boolean,
  valid: boolean
}) {
  return prisma.answer.update({
    where: { id: answerId },
    data,
  });
}

export async function createAnswer(questionId: number, data: {
  answerText: string,
  isCorrect: boolean
}) {
  return prisma.answer.create({
    data: {
      questionId,
      ...data,
    },
  });
}

export async function softDeleteQuiz(quizId: number) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: { valid: false },
  });
}

export async function createNewQuiz(creatorId: number, title: string, description: string, isPublic: boolean) {
  return prisma.quiz.create({
    data: {
      title,
      description,
      creatorId,
      isPublic,
    },
  });
}

export async function updatePassword(email: string, newPassword: string) {
  return prisma.user.update({
        where: { email: email },
        data: { password: newPassword },
  });
}
