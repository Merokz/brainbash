import { NextRequest, NextResponse } from "next/server";
import { recordMultipleAnswers, calculateMultipleChoiceScore, recordParticipantAnswer } from "@/lib/db";
import { getParticipantFromToken } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher-service";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the participant token from the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const participant = await getParticipantFromToken(token);
    
    if (!participant || participant.lobbyId !== Number(params.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { questionId, answerIds, timeToAnswer, timedOut = false } = await req.json();
    
    if (!questionId || !Array.isArray(answerIds) || timeToAnswer === undefined) {
      return NextResponse.json(
        { error: "Question ID, answer IDs array, and time to answer are required" },
        { status: 400 }
      );
    }
    
    // If timed out or empty selection, record with null answerIds
    if (timedOut || answerIds.length === 0) {
      const participantAnswer = await recordParticipantAnswer(
        participant.id,
        questionId,
        null,
        timeToAnswer
      );
      
      await pusherServer.trigger(
        CHANNELS.lobby(params.id),
        EVENTS.ANSWER_SUBMITTED,
        {
          participantId: participant.id,
          participantUsername: participant.username,
          questionId,
          answerIds: [],
          timeToAnswer,
          newScore: participant.score,
          pointsEarned: 0,
          isCorrect: false,
          accuracy: 0
        }
      );
      
      return NextResponse.json({ 
        success: true,
        participantAnswer,
        score: {
          newScore: participant.score,
          pointsEarned: 0,
          isCorrect: false
        }
      });
    }
    
    // Record multiple answers
    const participantAnswers = await recordMultipleAnswers(
      participant.id,
      questionId,
      answerIds,
      timeToAnswer
    );

    // Calculate score for multiple choice
    const scoreResult = await calculateMultipleChoiceScore(
      participant.id,
      questionId,
      answerIds,
      timeToAnswer
    );
    
    // Notify the host about the submitted answer
    await pusherServer.trigger(
      CHANNELS.lobby(params.id),
      EVENTS.ANSWER_SUBMITTED,
      {
        participantId: participant.id,
        participantUsername: participant.username,
        questionId,
        answerIds,
        timeToAnswer,
        newScore: scoreResult.newScore,
        pointsEarned: scoreResult.pointsEarned,
        isCorrect: scoreResult.isCorrect,
        accuracy: scoreResult.accuracy || 0
      }
    );
    
    return NextResponse.json({ 
      success: true,
      participantAnswers,
      score: scoreResult
    });
  } catch (error) {
    console.error("Error submitting multiple answers:", error);
    return NextResponse.json(
      { error: "Failed to submit answers" },
      { status: 500 }
    );
  }
}