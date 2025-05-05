"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Users } from "lucide-react"
// Update this import to use the new client-side module
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher-client"

export default function LobbyPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null)
  const [lobby, setLobby] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Fetch user and lobby data from API
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/auth/me')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
        }

        // Fetch lobby data
        const lobbyResponse = await fetch(`/api/lobbies/${params.id}`)
        if (lobbyResponse.ok) {
          const lobbyData = await lobbyResponse.json()
          setLobby(lobbyData)
          
          // Also set initial participants
          if (lobbyData.participants) {
            setParticipants(lobbyData.participants)
          }
        } else {
          console.error('Failed to fetch lobby data')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Get Pusher client using the singleton pattern
    const pusherClient = getPusherClient()
    
    // Set up Pusher channel for real-time updates
    const channel = pusherClient.subscribe(CHANNELS.lobby(params.id))
    
    // Listen for participants joining
    channel.bind(EVENTS.PARTICIPANT_JOINED, (data: any) => {
      setParticipants(prev => {
        // Check if participant already exists
        if (prev.some(p => p.id === data.participant.id)) {
          return prev
        }
        return [...prev, data.participant]
      })
    })
    
    // Listen for participants leaving
    channel.bind(EVENTS.PARTICIPANT_LEFT, (data: any) => {
      setParticipants(prev => 
        prev.filter(p => p.id !== data.participantId)
      )
    })
    
    // Listen for game start
    channel.bind(EVENTS.GAME_STARTED, (data: any) => {
      // Redirect to game host page
      router.push(`/game-host/${params.id}`)
    })
    
    return () => {
      // Clean up Pusher subscription
      pusherClient.unsubscribe(CHANNELS.lobby(params.id))
    }
  }, [params.id, router])

  const handleCopyJoinCode = async () => {
    const text = lobby?.joinCode
    if (!text) return

    // Try the modern clipboard API first (requires secure context)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        return
      } catch (err) {
        console.warn('navigator.clipboard failed', err)
      }
    }
  }
  const handleStartGame = async () => {
    try {
      // Call the API to start the game
      const response = await fetch(`/api/lobbies/${params.id}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Failed to start game:", await response.text());
      }
      // Pusher will handle the redirect via the GAME_STARTED event
    } catch (error) {
      console.error("Error starting game:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!lobby || !lobby.quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-4">Lobby not found</h2>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
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

              <div className="mb-4 rounded-xl p-xl bg-white">
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
