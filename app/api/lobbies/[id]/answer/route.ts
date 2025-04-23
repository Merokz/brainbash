import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getParticipantFromToken } from "@/lib/auth"
import { recordParticipantAnswer } from "@/lib/db"

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const lobbyId = Number.parseInt(params.id)

    if (isNaN(lobbyId)) {
      return NextResponse.json({ error: "Invalid lobby ID" }, { status: 400 })
    }

    const { token, questionId, answerId, timeToAnswer } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Missing participant token" }, { status: 400 })
    }

    // Verify participant
    const participant = await getParticipantFromToken(token)

    if (!participant || participant.lobbyId !== lobbyId) {
      return NextResponse.json({ error: "Invalid participant token" }, { status: 401 })
    }

    if (participant.lobby.state !== "IN_GAME") {
      return NextResponse.json({ error: "Game is not in progress" }, { status: 400 })
    }

    // Check if participant has already answered this question
    const existingAnswer = await prisma.participantAnswer.findFirst({
      where: {
        participantId: participant.id,
        questionId,
        valid: true,
      },
    })

    if (existingAnswer) {
      return NextResponse.json({ error: "You have already answered this question" }, { status: 400 })
    }

    // Record answer
    const answer = await recordParticipantAnswer(participant.id, questionId, answerId, timeToAnswer)

    // Check if answer is correct and update score
    if (answerId) {
      const correctAnswer = await prisma.answer.findFirst({
        where: {
          questionId,
          isCorrect: true,
          valid: true,
        },
      })

      if (correctAnswer && correctAnswer.id === answerId) {
        // Calculate score based on time to answer
        // Faster answers get more points
        const maxScore = 1000
        const timeLimit = participant.lobby.timeToAnswer
        const score = Math.max(0, Math.floor(maxScore * (1 - timeToAnswer / (timeLimit * 1000))))

        // Update participant score
        await prisma.participant.update({
          where: { id: participant.id },
          data: {
            score: {
              increment: score,
            },
          },
        })

        return NextResponse.json({
          correct: true,
          score,
          answer,
        })
      }
    }

    return NextResponse.json({
      correct: false,
      score: 0,
      answer,
    })
  } catch (error) {
    console.error("Error submitting answer:", error)
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 })
  }
}
