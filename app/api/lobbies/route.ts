import { NextRequest, NextResponse } from "next/server";
import { createLobby, getPublicLobbies } from "@/lib/commands";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer, EVENTS } from "@/lib/pusher-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, isPublic } = await req.json();

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const lobby = await createLobby(Number(quizId), user.id, Boolean(isPublic));

    // Trigger a Pusher event for public lobbies
    if (isPublic) {
      await pusherServer.trigger("public-lobbies", EVENTS.LOBBY_UPDATED, {
        action: "created",
        lobby: {
          id: lobby.id,
          joinCode: lobby.joinCode,
          quizId: lobby.quizId,
          hostId: lobby.hostId,
          host: { username: user.username },
        },
      });
    }

    return NextResponse.json(lobby);
  } catch (error) {
    console.error("Error creating lobby:", error);
    return NextResponse.json(
      { error: "Failed to create lobby" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const lobbies = await getPublicLobbies();
    if (!lobbies) {
      return NextResponse.json(
        { error: "No public lobbies found" },
        { status: 404 }
      );
    }
    return NextResponse.json(lobbies);
  } catch (error) {
    console.error("Error getting lobbies:", error);
    return NextResponse.json(
      { error: "Failed to get lobbies" },
      { status: 500 }
    );
  }
}
