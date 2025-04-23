"use client"

import { useEffect, useState } from "react"
import { QuizForm } from "@/components/quiz-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { Quiz } from "@prisma/client"

export default function EditQuiz({ params }: { params: { id: string} }) {
  const [quiz, setQuiz] = useState<Quiz>();
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  

  // In a real app, we would fetch the user data here
  // For now, we'll just simulate it
  useEffect(() => {
    async function fetchQuiz() {
        const response = await fetch(`/api/quizzes/${params.id}`);
        const data = await response.json();
        console.log(data);
        setQuiz(data);
    }
    setUser({ username: "User" });
    fetchQuiz();
    setLoading(false);
  }, [])

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
