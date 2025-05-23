"use client"

import { useEffect, useState, use } from "react";
import { Quiz } from "@prisma/client"
import { QuizForm } from "@/components/quiz/quiz-form";

export default function EditQuiz(props: { params: Promise<{ id: string}> }) {
  const params = use(props.params);
  const [quiz, setQuiz] = useState<Quiz>();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuiz() {
        const response = await fetch(`/api/quizzes/${params.id}`);
        const data = await response.json();
        console.log(data);
        setQuiz(data);
    }
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
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">edit quiz</h1>
        </div>

        <QuizForm quiz={quiz} />
      </main>
    </div>
  )
}
