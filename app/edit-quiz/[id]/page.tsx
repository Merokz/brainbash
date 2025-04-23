"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QuizForm } from "@/components/quiz-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { getUserFromToken } from "@/lib/auth"

export default async function EditQuiz({ params }: { params: { id: string, user: {}} }) {
  
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const user = await getUserFromToken();

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
      <DashboardHeader user={user} />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
        </div>

        <QuizForm quiz={quiz} />
      </main>
    </div>
  )
}
