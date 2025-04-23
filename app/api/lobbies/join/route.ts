import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromToken, createParticipantToken } from "@/lib/auth"
import { getLobbyByJoinCode, addParticipantToLobby, updateParticipantToken } from "@/lib/db"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { joinCode, username } = await request.json()

    // Find lobby
    const lobby = await getLobbyByJoinCode(joinCode)

    if (!lobby) {
      return NextResponse.json({ error: "Invalid join code" }, { status: 404 })
    }

    if (lobby.state === "CONCLUDED") {
      return NextResponse.json({ error: "This game has already ended" }, { status: 400 })
    }

    // Check if username is already taken in this lobby
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        lobbyId: lobby.id,
        username,
        valid: true,
      },
    })

    if (existingParticipant) {
      return NextResponse.json({ error: "Username already taken in this lobby" }, { status: 400 })
    }

    // Get current user (if logged in)
    const user = await getUserFromToken()

    // Add participant to lobby
    const participant = await addParticipantToLobby(lobby.id, username, user?.id)

    // Create participant token
    const token = await createParticipantToken(participant.id, lobby.id)

    // Update participant with token
    await updateParticipantToken(participant.id, token)

    return NextResponse.json({
      token,
      participant,
      lobby,
    })
  } catch (error) {
    console.error("Error joining lobby:", error)
    return NextResponse.json({ error: "Failed to join lobby" }, { status: 500 })
  }
}
