import { NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getPublicLobbies, createLobby } from "@/lib/db"

export async function GET() {
  try {
    const lobbies = await getPublicLobbies()
    return NextResponse.json(lobbies)
  } catch (error) {
    console.error("Error fetching lobbies:", error)
    return NextResponse.json({ error: "Failed to fetch lobbies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quizId, isPublic } = await request.json()

    const lobby = await createLobby(quizId, user.id, isPublic)

    return NextResponse.json(lobby)
  } catch (error) {
    console.error("Error creating lobby:", error)
    return NextResponse.json({ error: "Failed to create lobby" }, { status: 500 })
  }
}
