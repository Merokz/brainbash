import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromToken } from "@/lib/auth"
import { startGame } from "@/lib/db"
import { QuizHub } from "@/lib/signalr-hub"

const prisma = new PrismaClient()
const quizHub = QuizHub.getInstance()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const lobbyId = Number.parseInt(params.id)

    if (isNaN(lobbyId)) {
      return NextResponse.json({ error: "Invalid lobby ID" }, { status: 400 })
    }

    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
    })

    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 })
    }

    if (lobby.hostId !== user.id) {
      return NextResponse.json({ error: "Only the host can start the game" }, { status: 403 })
    }

    if (lobby.state !== "IN_LOBBY") {
      return NextResponse.json({ error: "Game has already started or concluded" }, { status: 400 })
    }

    // Start the game
    const updatedLobby = await startGame(lobbyId)

    // Notify all participants
    // This would be handled by SignalR in a real implementation

    return NextResponse.json(updatedLobby)
  } catch (error) {
    console.error("Error starting game:", error)
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 })
  }
}
