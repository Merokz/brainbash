"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Timer } from "lucide-react"

export default function GameHostPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [gameState, setGameState] = useState<"question" | "results" | "conclusion">("question")
  const [timeLeft, setTimeLeft] = useState(30)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // In a real app, we would fetch the user data, quiz data, and participants from an API
    // For now, we'll just simulate it
    setUser({ username: "Host User" })
    setQuiz({
      id: 1,
      title: "Sample Quiz",
      questions: [
        {
          id: 1,
          questionText: "What is the capital of France?",
          questionType: "SINGLE_CHOICE",
          answers: [
            { id: 1, answerText: "London", isCorrect: false },
            { id: 2, answerText: "Paris", isCorrect: true },
            { id: 3, answerText: "Berlin", isCorrect: false },
            { id: 4, answerText: "Madrid", isCorrect: false },
          ],
        },
        {
          id: 2,
          questionText: "Which of these are planets in our solar system?",
          questionType: "MULTIPLE_CHOICE",
          answers: [
            { id: 5, answerText: "Earth", isCorrect: true },
            { id: 6, answerText: "Mars", isCorrect: true },
            { id: 7, answerText: "Moon", isCorrect: false },
            { id: 8, answerText: "Jupiter", isCorrect: true },
          ],
        },
      ],
    })
    setParticipants([
      { id: 1, username: "Player1", score: 0 },
      { id: 2, username: "Player2", score: 0 },
      { id: 3, username: "Player3", score: 0 },
    ])
    setLoading(false)

    // Simulate timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Show results after time is up
          setGameState("results")

          // Update participant scores randomly
          setParticipants((prev) =>
            prev.map((p) => ({
              ...p,
              score: p.score + (Math.random() > 0.5 ? Math.floor(Math.random() * 500) : 0),
            })),
          )

          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setGameState("question")
      setTimeLeft(30)
    } else {
      // End of quiz
      setGameState("conclusion")
    }
  }

  const handleEndGame = () => {
    // In a real app, we would call an API to end the game
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 container py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {gameState === "question" && (
              <Card>
                <CardHeader>
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">Time remaining</div>
                      <div className="text-sm font-medium">{timeLeft}s</div>
                    </div>
                    <Progress value={(timeLeft / 30) * 100} />
                  </div>

                  <h2 className="text-xl font-bold mb-6">{currentQuestion.questionText}</h2>

                  <div className="space-y-4">
                    {currentQuestion.answers.map((answer: any) => (
                      <div key={answer.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div>{answer.answerText}</div>
                        {answer.isCorrect && <div className="text-sm text-muted-foreground">Correct answer</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState === "results" && (
              <Card>
                <CardHeader>
                  <CardTitle>Question Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-bold mb-6">{currentQuestion.questionText}</h2>

                  <div className="space-y-4 mb-6">
                    {currentQuestion.answers.map((answer: any) => (
                      <div
                        key={answer.id}
                        className={`p-3 border rounded-md flex justify-between items-center ${
                          answer.isCorrect
                            ? "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700"
                            : ""
                        }`}
                      >
                        <div>{answer.answerText}</div>
                        <div className="text-sm">
                          {/* Simulate random number of participants who chose this answer */}
                          {Math.floor(Math.random() * participants.length)} participants
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => setGameState("question")}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Question
                    </Button>
                    <Button onClick={handleNextQuestion}>
                      {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <>
                          Next Question
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "End Quiz"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState === "conclusion" && (
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Conclusion</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-bold mb-6">Final Results</h2>

                  <div className="space-y-2 mb-8">
                    {participants
                      .sort((a, b) => b.score - a.score)
                      .map((participant, index) => (
                        <div
                          key={participant.id}
                          className={`p-3 border rounded-md flex justify-between items-center ${
                            index === 0
                              ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700"
                              : ""
                          }`}
                        >
                          <div className="font-medium">
                            {index + 1}. {participant.username}
                            {index === 0 && " 🏆"}
                          </div>
                          <div>{participant.score} points</div>
                        </div>
                      ))}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleEndGame}>Return to Dashboard</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Tabs defaultValue="leaderboard">
              <TabsList className="w-full">
                <TabsTrigger value="leaderboard" className="flex-1">
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="participants" className="flex-1">
                  Participants
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {participants
                        .sort((a, b) => b.score - a.score)
                        .map((participant, index) => (
                          <div key={participant.id} className="p-3 border rounded-md flex justify-between items-center">
                            <div>
                              {index + 1}. {participant.username}
                            </div>
                            <div>{participant.score}</div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="participants">
                <Card>
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="p-3 border rounded-md flex justify-between items-center">
                          <div>{participant.username}</div>
                          <div className="text-sm text-muted-foreground">{participant.score} points</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
