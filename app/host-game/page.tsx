"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"

interface Quiz {
  id: number
  title: string
  description: string | null
  isPublic: boolean
  _count: {
    questions: number
  }
}

export default function HostGame() {
  const [user, setUser] = useState<any>(null)
  const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([])
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await fetch('/api/auth/me');
        if (user.ok) {
          const userData = await user.json();
          setUser(userData);
        }

        // Fetch public quizzes
        const publicResponse = await fetch("/api/quizzes?type=public")
        const publicData = await publicResponse.json()
        setPublicQuizzes(publicData)

        // Fetch user quizzes
        const userResponse = await fetch("/api/quizzes?type=user")
        const userData = await userResponse.json()
        setUserQuizzes(userData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleHostQuiz = async (quizId: number) => {
    try {
      const response = await fetch("/api/lobbies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId,
          isPublic: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/lobby/${data.id}`)
      } else {
        console.error("Failed to create lobby")
      }
    } catch (error) {
      console.error("Error creating lobby:", error)
    }
  }

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
          <h1 className="text-3xl font-bold">Host a Game</h1>
          <p className="text-muted-foreground">Select a quiz to host a new game</p>
        </div>

        <Tabs defaultValue="public">
          <TabsList className="mb-4">
            <TabsTrigger value="public">Public Quizzes</TabsTrigger>
            <TabsTrigger value="your">Your Quizzes</TabsTrigger>
          </TabsList>

          <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <TabsContent value="public" className="space-y-4">
              {publicQuizzes.length > 0 ? (
                publicQuizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description || "No description provided"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">{quiz._count.questions} questions</div>
                        <Button onClick={() => handleHostQuiz(quiz.id)}>Host Game</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">No public quizzes available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Suspense>

          <TabsContent value="your" className="space-y-4">
            {userQuizzes.length > 0 ? (
              userQuizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description || "No description provided"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">{quiz._count.questions} questions</div>
                      <Button onClick={() => handleHostQuiz(quiz.id)}>Host Game</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't created any quizzes yet</p>
                  <Link href="/create-quiz">
                    <Button>Create Your First Quiz</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
