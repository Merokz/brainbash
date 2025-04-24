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

// Calculate and update participant score
export async function calculateAndUpdateScore(
  participantId: number,
  questionId: number,
  answerId: number | null,
  timeToAnswer: number,
  timedOut: boolean = false
) {
  // Get the question details including correct answers
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      answers: { where: { valid: true } },
    },
  });

  if (!question) return { newScore: 0, pointsEarned: 0, isCorrect: false };

  // Get all answers for this question to determine position
  const allAnswers = await prisma.participantAnswer.findMany({
    where: { 
      questionId,
      valid: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Find position (1-based index)
  const position = allAnswers.findIndex(a => a.participantId === participantId) + 1;

  // Get total participants for this question's lobby
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { lobby: true },
  });

  if (!participant) return { newScore: 0, pointsEarned: 0, isCorrect: false };

  const totalParticipants = await prisma.participant.count({
    where: { 
      lobbyId: participant.lobbyId,
      valid: true,
    },
  });

  // Get the max time allowed for the question from the lobby
  const maxTime = participant.lobby.timeToAnswer || 30; // Default to 30 seconds
  
  // If the participant timed out, they get 0 points
  if (timedOut || !answerId) {
    // Update participant with zero score increment for this answer
    const updatedParticipant = await prisma.participant.update({
      where: { id: participantId },
      data: {
        score: {
          increment: 0,
        },
      },
    });

    return {
      newScore: updatedParticipant.score,
      pointsEarned: 0,
      isCorrect: false,
    };
  }

  // Calculate base score
  let score = 0;
  
  // Check if the answer is correct
  const submittedAnswer = question.answers.find(a => a.id === answerId);
  const correctAnswers = question.answers.filter(a => a.isCorrect);
  
  if (submittedAnswer && submittedAnswer.isCorrect) {
    // Time factor: Less time = more points (up to 80% of max points)
    const timeFactor = Math.max(0, 1 - (timeToAnswer / maxTime));
    
    // Position factor: Earlier position = more points (up to 15% bonus)
    const positionFactor = Math.max(0, 1 - ((position - 1) / totalParticipants));
    
    // Participant count factor: More participants = slightly more points
    const participantFactor = 0.05 * Math.min(1, totalParticipants / 10);
    
    // Calculate final score (max 1000 points)
    score = Math.round(
      1000 * (0.8 * timeFactor + 0.15 * positionFactor + participantFactor)
    );
  } else if (question.questionType === "MULTIPLE_CHOICE" && submittedAnswer) {
    // Time factor defined for multiple choice questions
    const timeFactor = Math.max(0, 1 - (timeToAnswer / maxTime));
    
    // For multiple choice, give partial credit based on how many they got right
    // This is simplified - in a real app you'd need to track all selected answers
    score = Math.round(500 * timeFactor);
  }

  // Update participant's score
  const updatedParticipant = await prisma.participant.update({
    where: { id: participantId },
    data: {
      score: {
        increment: score,
      },
    },
  });

  return {
    newScore: updatedParticipant.score,
    pointsEarned: score,
    isCorrect: submittedAnswer?.isCorrect || false,
  };
}

// This is an improved version to properly handle multiple-choice questions scoring
export async function calculateMultipleChoiceScore(
  participantId: number,
  questionId: number,
  answerIds: number[],
  timeToAnswer: number
) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      answers: { where: { valid: true } },
    },
  });

  if (!question) return { newScore: 0, pointsEarned: 0, isCorrect: false };

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { lobby: true },
  });

  if (!participant) return { newScore: 0, pointsEarned: 0, isCorrect: false };

  // Get the position of this answer submission
  const allAnswers = await prisma.participantAnswer.findMany({
    where: { 
      questionId,
      valid: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  
  const position = allAnswers.findIndex(a => a.participantId === participantId) + 1;
  
  const totalParticipants = await prisma.participant.count({
    where: { 
      lobbyId: participant.lobbyId,
      valid: true,
    },
  });

  const maxTime = participant.lobby.timeToAnswer || 30;
  const timeFactor = Math.max(0, 1 - (timeToAnswer / maxTime));
  const positionFactor = Math.max(0, 1 - ((position - 1) / totalParticipants));
  const participantFactor = 0.05 * Math.min(1, totalParticipants / 10);

  // Calculate correctness factor
  const correctAnswers = question.answers.filter(a => a.isCorrect);
  const incorrectAnswers = question.answers.filter(a => !a.isCorrect);
  
  // Count correct selections
  const correctSelections = answerIds.filter(id => 
    correctAnswers.some(a => a.id === id)
  ).length;
  
  // Count incorrect selections
  const incorrectSelections = answerIds.filter(id => 
    incorrectAnswers.some(a => a.id === id)
  ).length;
  
  // Calculate accuracy percentage
  const totalCorrectAnswers = correctAnswers.length;
  const accuracy = totalCorrectAnswers > 0 ? 
    (correctSelections / totalCorrectAnswers) : 0;
  
  // Penalty for incorrect selections
  const penalty = incorrectSelections > 0 ? 
    (incorrectSelections / incorrectAnswers.length) * 0.5 : 0;
  
  // Final correctness factor (between 0 and 1)
  const correctnessFactor = Math.max(0, accuracy - penalty);
  
  // Calculate score
  const score = Math.round(
    1000 * correctnessFactor * (0.8 * timeFactor + 0.15 * positionFactor + participantFactor)
  );
  
  // Update participant's score
  const updatedParticipant = await prisma.participant.update({
    where: { id: participantId },
    data: {
      score: {
        increment: score,
      },
    },
  });

  return {
    newScore: updatedParticipant.score,
    pointsEarned: score,
    isCorrect: correctnessFactor > 0,
    accuracy: Math.round(correctnessFactor * 100)
  };
}

// This function allows recording multiple answers for a single participant on a question
export async function recordMultipleAnswers(
  participantId: number,
  questionId: number,
  answerIds: number[],
  timeToAnswer: number
) {
  // Create records for each selected answer
  const answers = await Promise.all(
    answerIds.map(answerId => 
      prisma.participantAnswer.create({
        data: {
          participantId,
          questionId,
          answerId,
          timeToAnswer,
        },
      })
    )
  );
  
  return answers;
}
