"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QuizForm } from "@/components/quiz-form"
import { DashboardHeader } from "@/components/dashboard-header"

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
          <h1 className="text-3xl font-bold">Create New Quiz</h1>
          <p className="text-muted-foreground">Create a new quiz with questions and answers</p>
        </div>

        <QuizForm />
      </main>
    </div>
  )
}
