import { NextResponse } from "next/server"
import { createAnswer, createNewQuiz, createQuestion, prisma } from '@/lib/db';
import { getUserFromToken } from "@/lib/auth"



export async function POST(request: Request) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, isPublic, questions } = await request.json()
  
    const quiz = await createNewQuiz(
      user.id, 
      title, 
      description, 
      isPublic
    );

    // Create questions and answers
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]

        const question = await createQuestion(quiz.id, {
          questionText: q.questionText,
          image: q.image,
          orderNum: i,
          questionType: q.questionType
        })

        if (q.answers && Array.isArray(q.answers)) {
          for (const a of q.answers) {
            await createAnswer(question.id, {
              answerText: a.answerText,
              isCorrect: a.isCorrect,
            })
          }
        }
      }
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}
