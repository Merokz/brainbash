import { NextRequest, NextResponse } from "next/server";
import { startGame, getQuizById, getLobbyById } from "@/lib/db";
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
    
    // Get the lobby to check if the user is the host
    const lobby = await getLobbyById(lobbyId);
    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }
    
    if (lobby.hostId !== user.id) {
      return NextResponse.json({ error: "Only the host can start the game" }, { status: 403 });
    }
    
    // Start the game in the database
    const updatedLobby = await startGame(lobbyId);
    
    // Get the quiz details for the game
    const quiz = await getQuizById(updatedLobby.quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    
    // Create a simplified version of questions without correct answers
    // for participants
    const participantQuestions = quiz.questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      image: q.image,
      answers: q.answers.map(a => ({
        id: a.id,
        answerText: a.answerText,
      })),
    }));
    
    // Send the full quiz to the host
    await pusherServer.trigger(
      CHANNELS.lobby(lobbyId.toString()),
      EVENTS.GAME_STARTED,
      {
        quiz: quiz,
        hostView: true,
      }
    );
    
    // Send the questions without correct answers to participants
    await pusherServer.trigger(
      CHANNELS.game(lobbyId.toString()),
      EVENTS.GAME_STARTED,
      {
        quiz: {
          ...quiz,
          questions: participantQuestions,
        },
        hostView: false,
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: "Game started successfully" 
    });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
