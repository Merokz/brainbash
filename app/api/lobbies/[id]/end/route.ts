import { NextRequest, NextResponse } from "next/server";
import { endGame, getGameResults } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher-service";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lobbyId = Number(params.id);
    
    // End the game in the database
    const updatedLobby = await endGame(lobbyId);
    
    // Get the final results
    const results = await getGameResults(lobbyId);
    
    // Notify all participants that the game has ended
    await pusherServer.trigger(
      CHANNELS.game(lobbyId.toString()),
      EVENTS.GAME_ENDED,
      {
        results: results.map(p => ({
          id: p.id,
          username: p.username,
          score: p.score,
        }))
      }
    );
    
    // Send detailed results to the host
    await pusherServer.trigger(
      CHANNELS.lobby(lobbyId.toString()),
      EVENTS.GAME_ENDED,
      {
        results: results,
        hostView: true
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: "Game ended successfully",
      results 
    });
  } catch (error) {
    console.error("Error ending game:", error);
    return NextResponse.json(
      { error: "Failed to end game" },
      { status: 500 }
    );
  }
}
