import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromToken } from "@/lib/auth"
import { getQuizById } from "@/lib/db"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const quizId = Number.parseInt(params.id)

    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }

    const quiz = await getQuizById(quizId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // If quiz is private, check if user is the creator
    if (!quiz.isPublic) {
      const user = await getUserFromToken()

      if (!user || user.id !== quiz.creatorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const quizId = Number.parseInt(params.id)

    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }

    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    if (quiz.creatorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, isPublic, questions } = await request.json()

    // Update quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        description,
        isPublic,
      },
    })

    // Update questions and answers
    if (questions && Array.isArray(questions)) {
      // First, mark all existing questions as invalid
      await prisma.question.updateMany({
        where: { quizId },
        data: { valid: false },
      })

      // Then create or update questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]

        let question
        if (q.id) {
          // Update existing question
          question = await prisma.question.update({
            where: { id: q.id },
            data: {
              questionText: q.questionText,
              image: q.image,
              orderNum: i,
              questionType: q.questionType,
              valid: true,
            },
          })
        } else {
          // Create new question
          question = await prisma.question.create({
            data: {
              quizId,
              questionText: q.questionText,
              image: q.image,
              orderNum: i,
              questionType: q.questionType,
            },
          })
        }

        // Mark all existing answers as invalid
        await prisma.answer.updateMany({
          where: { questionId: question.id },
          data: { valid: false },
        })

        // Create or update answers
        if (q.answers && Array.isArray(q.answers)) {
          for (const a of q.answers) {
            if (a.id) {
              // Update existing answer
              await prisma.answer.update({
                where: { id: a.id },
                data: {
                  answerText: a.answerText,
                  isCorrect: a.isCorrect,
                  valid: true,
                },
              })
            } else {
              // Create new answer
              await prisma.answer.create({
                data: {
                  questionId: question.id,
                  answerText: a.answerText,
                  isCorrect: a.isCorrect,
                },
              })
            }
          }
        }
      }
    }

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const quizId = Number.parseInt(params.id)

    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }

    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    if (quiz.creatorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Soft delete the quiz
    await prisma.quiz.update({
      where: { id: quizId },
      data: { valid: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
