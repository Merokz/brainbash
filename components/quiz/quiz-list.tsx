"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Quiz {
  id: number
  title: string
  isPublic: boolean
  _count: {
    questions: number
  }
}

interface QuizListProps {
  quizzes: Quiz[]
}

export function QuizList({ quizzes }: QuizListProps) {
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/quizzes/${deleteQuizId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh the page to update the quiz list
        router.refresh()
      } else {
        console.error("Failed to delete quiz")
      }
    } catch (error) {
      console.error("Error deleting quiz:", error)
    } finally {
      setIsDeleting(false)
      setDeleteQuizId(null)
    }
  }

  if (quizzes.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>you haven't created any quizzes yet</p>
        <Link href="/create-quiz" className="mt-4 inline-block">
          <Button>create your first quiz</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{quiz.title}</h3>
              <Badge variant={quiz.isPublic ? "default" : "outline"}>
                {quiz.isPublic ? "public" : "private"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {quiz._count.questions}/8 questions
              {quiz._count.questions < 8 && " • can add more questions"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href={`/edit-quiz/${quiz.id}`}>
              <Button variant="outline" size="sm">
                edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setDeleteQuizId(quiz.id)}>
              delete
            </Button>
          </div>
        </div>
      ))}

      <AlertDialog open={!!deleteQuizId} onOpenChange={(open) => !open && setDeleteQuizId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              this action cannot be undone. this will permanently delete the quiz and all associated questions and
              answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} disabled={isDeleting}>
              {isDeleting ? "deleting..." : "delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
