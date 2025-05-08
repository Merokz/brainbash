import { NextRequest, NextResponse } from "next/server";
import { startGame, getQuizById, getLobbyById } from "@/lib/commands";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher-service";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lobbyId = Number(params.id);

    // Get the lobby to check if the user is the host
    const lobby = await getLobbyById(lobbyId);
    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }

    // Check if user is the host
    if (lobby.hostId !== user.id) {
      return NextResponse.json(
        { error: "Only the host can start the game" },
        { status: 403 }
      );
    }

    // Start the game in the database
    const updatedLobby = await startGame(lobbyId);

    // Get the quiz details for the game
    const quiz = await getQuizById(updatedLobby.quizId);

    // Create participant and host views of the quiz
    const hostView = quiz;

    const participantView = quiz
      ? {
          ...quiz,
          questions: quiz.questions.map((q) => ({
            ...q,
            answers: q.answers.map((a) => ({
              id: a.id,
              answerText: a.answerText,
              // Don't send correctness info
            })),
          })),
        }
      : null;

    // Notify all clients (participants and host) that the game has started
    await pusherServer.trigger(CHANNELS.lobby(params.id), EVENTS.GAME_STARTED, {
      hostView: true,
      quiz: hostView,
    });

    // Notify game channel (only has participants)
    await pusherServer.trigger(CHANNELS.game(params.id), EVENTS.GAME_STARTED, {
      hostView: false,
      quiz: participantView,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
