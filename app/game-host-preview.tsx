"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Timer } from "lucide-react"

export default function GameHostPreview() {
  const [timeLeft] = useState(20)
  const [participants] = useState([
    { id: 1, username: "Player1", score: 500 },
    { id: 2, username: "Player2", score: 300 },
    { id: 3, username: "Player3", score: 200 },
    { id: 4, username: "Player4", score: 100 },
  ])

  return (
    <main className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">General Knowledge Quiz</h1>
          <p className="text-muted-foreground">Question 1 of 10</p>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5" />
          <span className="font-bold">{timeLeft}s</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Question 1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Time remaining</div>
                  <div className="text-sm font-medium">{timeLeft}s</div>
                </div>
                <Progress value={(timeLeft / 30) * 100} />
              </div>

              <h2 className="text-xl font-bold mb-6">What is the capital of France?</h2>

              <div className="space-y-4">
                <div className="p-3 border rounded-md flex justify-between items-center">
                  <div>London</div>
                </div>
                <div className="p-3 border rounded-md flex justify-between items-center bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700">
                  <div>Paris</div>
                  <div className="text-sm text-muted-foreground">Correct answer</div>
                </div>
                <div className="p-3 border rounded-md flex justify-between items-center">
                  <div>Berlin</div>
                </div>
                <div className="p-3 border rounded-md flex justify-between items-center">
                  <div>Madrid</div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button>
                  Next Question
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
  )
}
