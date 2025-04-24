import { NextRequest, NextResponse } from "next/server";
import { getLobbyById, getQuizById } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lobbyId = Number(params.id);
    
    // Get the lobby
    const lobby = await getLobbyById(lobbyId);
    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }
    
    // Check if user is the host
    if (lobby.hostId !== user.id) {
      return NextResponse.json({ error: "Only the host can end questions" }, { status: 403 });
    }
    
    // Get the question data
    const { questionIndex } = await req.json();
    
    // Get quiz with questions
    const quiz = await getQuizById(lobby.quizId);
    console.log(`There are ${quiz?.questions?.length || 0} questions in total.`)
    if (!quiz || !quiz.questions || questionIndex >= quiz.questions.length) {
      return NextResponse.json({ error: "Invalid question index" }, { status: 400 });
    }
    
    const question = quiz.questions[questionIndex];
    
    // Get the correct answers for this question
    const correctAnswers = question.answers.filter(a => a.isCorrect);
    
    // Notify participants that the question has ended
    await pusherServer.trigger(
      CHANNELS.game(lobbyId.toString()),
      EVENTS.QUESTION_ENDED,
      {
        questionIndex,
        correctAnswers,
        isLastQuestion: questionIndex >= quiz.questions.length - 1
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: "Question ended successfully" 
    });
  } catch (error) {
    console.error("Error ending question:", error);
    return NextResponse.json(
      { error: "Failed to end question" },
      { status: 500 }
    );
  }
}