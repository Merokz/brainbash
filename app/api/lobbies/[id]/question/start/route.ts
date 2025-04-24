import { NextRequest, NextResponse } from "next/server";
import { getLobbyById, getQuizById } from "@/lib/db";
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
    
    // Get the lobby
    const lobby = await getLobbyById(lobbyId);
    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }
    
    // Check if user is the host
    if (lobby.hostId !== user.id) {
      return NextResponse.json({ error: "Only the host can start questions" }, { status: 403 });
    }
    
    // Get the question data
    const { questionIndex, timeToAnswer } = await req.json();
    
    // Get quiz with questions
    const quiz = await getQuizById(lobby.quizId);
    if (!quiz || !quiz.questions || questionIndex >= quiz.questions.length) {
      return NextResponse.json({ error: "Invalid question index" }, { status: 400 });
    }
    
    const question = quiz.questions[questionIndex];
    
    // Create a version of the question without correct answer info for participants
    const participantQuestion = {
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      image: question.image,
      answers: question.answers.map(a => ({
        id: a.id,
        answerText: a.answerText,
      })),
    };
    
    // Send the question to participants
    await pusherServer.trigger(
      CHANNELS.game(lobbyId.toString()),
      EVENTS.QUESTION_STARTED,
      {
        question: participantQuestion,
        questionIndex,
        timeToAnswer: timeToAnswer || 30
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: "Question started successfully" 
    });
  } catch (error) {
    console.error("Error starting question:", error);
    return NextResponse.json(
      { error: "Failed to start question" },
      { status: 500 }
    );
  }
}