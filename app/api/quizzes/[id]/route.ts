// filepath: c:\dev\brainbash\app\api\quizzes\[id]\route.ts
import { NextResponse } from "next/server"
import { 
  findQuizById, 
  updateQuiz, 
  invalidateQuestionsForQuiz, 
  updateQuestion, 
  createQuestion, 
  invalidateAnswersForQuestion, 
  updateAnswer, 
  createAnswer, 
  getQuizById,
  softDeleteQuiz
} from '@/lib/db';
import { getUserFromToken } from "@/lib/auth"
import { saveBase64Image } from "@/lib/save-image"


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

    const quiz = await findQuizById(quizId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    if (quiz.creatorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, isPublic, questions } = await request.json()

    // Update quiz
    const updatedQuiz = await updateQuiz(quizId, title, description, isPublic)

    // Update questions and answers
    if (questions && Array.isArray(questions)) {
      // First, mark all existing questions as invalid
      await invalidateQuestionsForQuiz(quizId)

      // Then create or update questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        let imagePath = "";
        
                if (q.image && q.image.startsWith("data:image/")) {
                  const fileName = `${quiz.id}-${i}`; // or 
                  imagePath = await saveBase64Image(q.image, fileName);
                }
        let question
        if (q.id) {
          // Update existing question
          question = await updateQuestion(q.id, {
            questionText: q.questionText,
            image: imagePath,
            orderNum: i,
            questionType: q.questionType,
            valid: true,
          })
        } else {
          // Create new question
          question = await createQuestion(quizId, {
            questionText: q.questionText,
            image: q.image,
            orderNum: i,
            questionType: q.questionType,
          })
        }

        // Mark all existing answers as invalid
        await invalidateAnswersForQuestion(question.id)

        // Create or update answers
        if (q.answers && Array.isArray(q.answers)) {
          for (const a of q.answers) {
            if (a.id) {
              // Update existing answer
              await updateAnswer(a.id, {
                answerText: a.answerText,
                isCorrect: a.isCorrect,
                valid: true,
              })
            } else {
              // Create new answer
              await createAnswer(question.id, {
                answerText: a.answerText,
                isCorrect: a.isCorrect,
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

    const quiz = await findQuizById(quizId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    if (quiz.creatorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Soft delete the quiz
    await softDeleteQuiz(quizId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
