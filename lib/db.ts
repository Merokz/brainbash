import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
      quiz: true,
      host: {
        select: {
          username: true,
        },
      },
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

// Game functions
export async function startGame(lobbyId: number) {
  return prisma.lobby.update({
    where: { id: lobbyId },
    data: { state: "IN_GAME" },
  })
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
