"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Users } from "lucide-react"

export default function LobbyPreview() {
  const [participants] = useState([
    { id: 1, username: "Player1" },
    { id: 2, username: "Player2" },
    { id: 3, username: "Player3" },
    { id: 4, username: "Player4" },
  ])

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lobby: General Knowledge Quiz</h1>
        <p className="text-muted-foreground">Waiting for participants to join</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Join Code</CardTitle>
            <CardDescription>Share this code with participants to join the game</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-4">12345</div>
            <Button variant="outline" className="mb-6">
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>

            <div className="mb-4 border p-4 rounded-lg">
              {/* QR Code would be here */}
              <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center">QR Code</div>
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
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>{participant.username}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg">Start Game</Button>
      </div>
    </main>
  )
}
