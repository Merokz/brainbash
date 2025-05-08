"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QuizForm } from "@/components/quiz/quiz-form"

export default function CreateQuiz() {
  const [loading, setLoading] = useState(true)

  // In a real app, we would fetch the user data here
  // For now, we'll just simulate it
  useState(() => {
    setLoading(false)
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">create new quiz</h1>
          <p className="text-muted-foreground">create a quiz with up to 8 questions</p>
        </div>

        <div className="bg-muted p-4 rounded-lg mb-8">
          <h2 className="text-lg font-medium mb-2">quiz guidelines:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>each quiz can have up to 8 questions</li>
            <li>support for multiple choice, single choice, true/false, and open-ended questions</li>
            <li>you can upload one image per question (optional)</li>
            <li>make quizzes public to allow others to use them for games</li>
          </ul>
        </div>

        <QuizForm />
      </main>
    </div>
  )
}
