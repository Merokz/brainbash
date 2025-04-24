import { NextRequest, NextResponse } from "next/server";
import { startGame, getQuizById } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lobbyId = Number(params.id);
    
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
