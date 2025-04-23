"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPreview() {
  const [quizzes] = useState([
    {
      id: 1,
      title: "General Knowledge Quiz",
      isPublic: true,
      _count: { questions: 10 },
    },
    {
      id: 2,
      title: "Science Trivia",
      isPublic: true,
      _count: { questions: 8 },
    },
    {
      id: 3,
      title: "Team Quiz",
      isPublic: false,
      _count: { questions: 15 },
    },
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">BrainBash</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/create-quiz">
                <Button variant="ghost">Create Quiz</Button>
              </Link>
              <Link href="/host-game">
                <Button variant="ghost">Host Game</Button>
              </Link>
            </nav>
            <Button variant="outline">QuizMaster</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="space-x-4">
            <Link href="/create-quiz">
              <Button>Create Quiz</Button>
            </Link>
            <Link href="/host-game">
              <Button variant="outline">Host Game</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Quizzes</CardTitle>
              <CardDescription>Manage your created quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{quiz.title}</h3>
                        <Badge variant={quiz.isPublic ? "default" : "outline"}>
                          {quiz.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{quiz._count.questions} questions</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Games</CardTitle>
              <CardDescription>View your recently hosted games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">General Knowledge Quiz</h3>
                    <p className="text-sm text-muted-foreground">Played 2 hours ago • 8 participants</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Results
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Science Trivia</h3>
                    <p className="text-sm text-muted-foreground">Played yesterday • 5 participants</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
