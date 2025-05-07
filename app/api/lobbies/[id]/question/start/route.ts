import { NextRequest, NextResponse } from "next/server";
import { endQuestion, getLobbyById, getQuizById, startQuestion } from "@/lib/db";
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
    
    // Start the question in the database with server timestamp
    await startQuestion(lobbyId, questionIndex);
    
    // Create server timestamp once and use the same value for database and clients
    const serverTimestamp = new Date();
    
    // Notify clients of question start with server timestamp
    await pusherServer.trigger(
      CHANNELS.game(lobbyId.toString()),
      EVENTS.QUESTION_STARTED,
      {
        question: participantQuestion,
        questionIndex: questionIndex,
        timeToAnswer: timeToAnswer || 30,
        serverStartTime: serverTimestamp.toISOString() // Use the same timestamp
      }
    );
    
    // Set up a server-side timeout to end the question
    setTimeout(async () => {
      try {
        // Check if the question is still active before ending it
        const lobby = await getLobbyById(lobbyId);
        if (lobby && 
            lobby.state === "IN_GAME" && 
            lobby.currentQuestionIdx === questionIndex) {
            
          await endQuestion(lobbyId);
          
          // Send proper metadata with question-ended event
          const correctAnswers = quiz.questions[questionIndex].answers.filter(a => a.isCorrect);
          
          await pusherServer.trigger(
            CHANNELS.game(lobbyId.toString()),
            EVENTS.QUESTION_ENDED,
            { 
              questionIndex,
              correctAnswers,
              isLastQuestion: questionIndex >= quiz.questions.length - 1
            }
          );
        }
      } catch (endError) {
        console.error("Error in question timeout handler:", endError);
      }
    }, (timeToAnswer || 30) * 1000);
    
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