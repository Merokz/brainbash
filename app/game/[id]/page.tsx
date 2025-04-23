"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export default function GamePage({ params }: { params: { id: string } }) {
  const [token, setToken] = useState<string | null>(null)
  const [gameState, setGameState] = useState<"waiting" | "question" | "results" | "conclusion">("waiting")
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [openAnswer, setOpenAnswer] = useState("")
  const [results, setResults] = useState<any>(null)
  const [conclusion, setConclusion] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get participant token from localStorage
    const storedToken = localStorage.getItem("participant_token")
    const storedLobbyId = localStorage.getItem("lobby_id")

    if (!storedToken || storedLobbyId !== params.id) {
      // Redirect to home if no token or wrong lobby
      router.push("/")
      return
    }

    setToken(storedToken)

    // In a real app, we would set up a SignalR connection to receive real-time updates
    // For now, we'll just simulate it

    // Simulate waiting for game to start
    setTimeout(() => {
      // Simulate first question
      setGameState("question")
      setCurrentQuestion({
        id: 1,
        questionText: "What is the capital of France?",
        questionType: "SINGLE_CHOICE",
        answers: [
          { id: 1, answerText: "London" },
          { id: 2, answerText: "Paris" },
          { id: 3, answerText: "Berlin" },
          { id: 4, answerText: "Madrid" },
        ],
      })
      setTimeLeft(30)

      // Simulate timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Simulate question timeout
      setTimeout(() => {
        clearInterval(timer)

        // Show results
        setGameState("results")
        setResults({
          correct: selectedAnswers.includes(2),
          correctAnswer: "Paris",
          score: selectedAnswers.includes(2) ? 500 : 0,
        })

        // Simulate next question or conclusion
        setTimeout(() => {
          // For this demo, we'll just show the conclusion
          setGameState("conclusion")
          setConclusion({
            rank: 3,
            score: 500,
            totalParticipants: 10,
            topPlayers: [
              { username: "Player1", score: 2500 },
              { username: "Player2", score: 1800 },
              { username: "You", score: 500 },
            ],
          })
        }, 5000)
      }, 30000)
    }, 3000)
  }, [params.id, router, selectedAnswers])

  const handleAnswerSelect = (answerId: number) => {
    if (currentQuestion?.questionType === "MULTIPLE_CHOICE") {
      // For multiple choice, toggle the selected answer
      setSelectedAnswers((prev) =>
        prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId],
      )
    } else {
      // For single choice, replace the selected answer
      setSelectedAnswers([answerId])
    }
  }

  const handleSubmitAnswer = async () => {
    // In a real app, we would submit the answer to the server
    // For now, we'll just simulate it

    if (currentQuestion?.questionType === "OPEN_ENDED") {
      // Submit open-ended answer
      console.log("Submitting open-ended answer:", openAnswer)
    } else {
      // Submit selected answers
      console.log("Submitting answers:", selectedAnswers)
    }

    // Disable the submit button after submission
    setSelectedAnswers([])
    setOpenAnswer("")
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted p-4">
      <div className="flex-1 flex items-center justify-center">
        {gameState === "waiting" && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Waiting for the host to start the game</h2>
              <div className="animate-pulse flex justify-center">
                <div className="h-4 w-4 bg-primary rounded-full mx-1"></div>
                <div className="h-4 w-4 bg-primary rounded-full mx-1 animate-pulse delay-150"></div>
                <div className="h-4 w-4 bg-primary rounded-full mx-1 animate-pulse delay-300"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === "question" && currentQuestion && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Time remaining</div>
                  <div className="text-sm font-medium">{timeLeft}s</div>
                </div>
                <Progress value={(timeLeft / 30) * 100} />
              </div>

              <h2 className="text-xl font-bold mb-6">{currentQuestion.questionText}</h2>

              {currentQuestion.questionType === "OPEN_ENDED" ? (
                <div className="space-y-4">
                  <Input
                    value={openAnswer}
                    onChange={(e) => setOpenAnswer(e.target.value)}
                    placeholder="Type your answer here"
                  />
                  <Button className="w-full" onClick={handleSubmitAnswer} disabled={!openAnswer.trim()}>
                    Submit Answer
                  </Button>
                </div>
              ) : currentQuestion.questionType === "SINGLE_CHOICE" || currentQuestion.questionType === "TRUE_FALSE" ? (
                <div className="space-y-4">
                  <RadioGroup
                    value={selectedAnswers[0]?.toString()}
                    onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                  >
                    {currentQuestion.answers.map((answer: any) => (
                      <div key={answer.id} className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} />
                        <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                          {answer.answerText}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button className="w-full" onClick={handleSubmitAnswer} disabled={selectedAnswers.length === 0}>
                    Submit Answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQuestion.answers.map((answer: any) => (
                    <div key={answer.id} className="flex items-center space-x-2 p-3 border rounded-md">
                      <Checkbox
                        id={`answer-${answer.id}`}
                        checked={selectedAnswers.includes(answer.id)}
                        onCheckedChange={() => handleAnswerSelect(answer.id)}
                      />
                      <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                        {answer.answerText}
                      </Label>
                    </div>
                  ))}
                  <Button className="w-full" onClick={handleSubmitAnswer} disabled={selectedAnswers.length === 0}>
                    Submit Answer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {gameState === "results" && results && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-8">
              <div className={`text-2xl font-bold mb-4 ${results.correct ? "text-green-500" : "text-red-500"}`}>
                {results.correct ? "Correct!" : "Incorrect!"}
              </div>
              <div className="mb-4">
                The correct answer was: <span className="font-bold">{results.correctAnswer}</span>
              </div>
              <div className="text-xl">
                You earned <span className="font-bold">{results.score}</span> points
              </div>
              <div className="mt-6 text-sm text-muted-foreground">Next question coming up...</div>
            </CardContent>
          </Card>
        )}

        {gameState === "conclusion" && conclusion && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-8">
              <h2 className="text-2xl font-bold mb-6">Game Conclusion</h2>
              <div className="mb-6">
                <div className="text-lg">
                  Your Rank:{" "}
                  <span className="font-bold">
                    {conclusion.rank}/{conclusion.totalParticipants}
                  </span>
                </div>
                <div className="text-lg">
                  Your Score: <span className="font-bold">{conclusion.score}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Top Players</h3>
              <div className="space-y-2">
                {conclusion.topPlayers.map((player: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-md flex justify-between items-center ${player.username === "You" ? "bg-muted" : ""}`}
                  >
                    <div className="font-medium">
                      {index + 1}. {player.username}
                    </div>
                    <div>{player.score} points</div>
                  </div>
                ))}
              </div>

              <Button className="mt-8 w-full" onClick={() => router.push("/")}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
