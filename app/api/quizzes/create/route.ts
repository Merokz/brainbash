import { NextResponse } from "next/server"
import { prisma } from '@/lib/db';
import { getUserFromToken } from "@/lib/auth"
import { saveBase64Image } from "@/lib/save-image"



export async function POST(request: Request) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, isPublic, questions } = await request.json()

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        creatorId: user.id,
        isPublic,
      },
    })

    // Create questions and answers
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        let imagePath = null;

        if (q.image && q.image.startsWith("data:image/")) {
          const fileName = `${quiz.id}-${i}`; // or 
          imagePath = await saveBase64Image(q.image, fileName);
        }
        const question = await prisma.question.create({
          data: {
            quizId: quiz.id,
            questionText: q.questionText,
            image: imagePath,
            orderNum: i,
            questionType: q.questionType,
          },
        })

        if (q.answers && Array.isArray(q.answers)) {
          for (const a of q.answers) {
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

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}
