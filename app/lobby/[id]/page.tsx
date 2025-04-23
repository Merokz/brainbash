"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Users } from "lucide-react"

export default function LobbyPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [lobby, setLobby] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // In a real app, we would fetch the user data and lobby data from an API
    // For now, we'll just simulate it
    setUser({ username: "Host User" })
    setLobby({
      id: params.id,
      joinCode: "12345",
      quiz: {
        title: "Sample Quiz",
        description: "A sample quiz for demonstration",
      },
    })
    setParticipants([])
    setLoading(false)

    // In a real app, we would set up a SignalR connection to receive real-time updates
    // For now, we'll just simulate it with a timer
    const interval = setInterval(() => {
      setParticipants((prev) => {
        // Simulate random participants joining
        if (Math.random() > 0.7 && prev.length < 10) {
          const newParticipant = {
            id: Date.now(),
            username: `User${prev.length + 1}`,
            score: 0,
          }
          return [...prev, newParticipant]
        }
        return prev
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [params.id])

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(lobby.joinCode)
  }

  const handleStartGame = () => {
    // In a real app, we would call an API to start the game
    router.push(`/game-host/${params.id}`)
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
          <h1 className="text-3xl font-bold">Lobby: {lobby.quiz.title}</h1>
          <p className="text-muted-foreground">Waiting for participants to join</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Join Code</CardTitle>
              <CardDescription>Share this code with participants to join the game</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-4">{lobby.joinCode}</div>
              <Button variant="outline" onClick={handleCopyJoinCode} className="mb-6">
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>

              <div className="mb-4">
                <QRCodeSVG value={`https://brainbash.app/join?code=${lobby.joinCode}`} size={200} />
              </div>
              <p className="text-sm text-muted-foreground">Participants can also scan this QR code to join</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Participants ({participants.length})
              </CardTitle>
              <CardDescription>Players who have joined the lobby</CardDescription>
            </CardHeader>
            <CardContent>
              {participants.length > 0 ? (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="p-3 border rounded-md flex justify-between items-center">
                      <div>{participant.username}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No participants have joined yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={handleStartGame} disabled={participants.length === 0}>
            Start Game
          </Button>
        </div>
      </main>
    </div>
  )
}
