"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function JoinPrivateGame() {
  const [joinCode, setJoinCode] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!joinCode.trim() || !username.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/lobbies/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          joinCode,
          username,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Store participant token in localStorage
        localStorage.setItem("participant_token", data.token)
        localStorage.setItem("lobby_id", data.lobby.id.toString())

        // Redirect to game page
        router.push(`/game/${data.lobby.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to join game")
      }
    } catch (error) {
      console.error("Error joining game:", error)
      setError("An error occurred while joining the game")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Private Game</CardTitle>
        <CardDescription>Enter a 5-digit code to join a private quiz game</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-code">Game Code</Label>
            <Input
              id="join-code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter 5-digit code"
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <Button type="submit" className="w-full" disabled={!joinCode.trim() || !username.trim() || loading}>
            {loading ? "Joining..." : "Join Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
