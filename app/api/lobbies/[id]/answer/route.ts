import { NextRequest, NextResponse } from "next/server";
import { recordParticipantAnswer } from "@/lib/db";
import { getParticipantFromToken } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    
    const { questionId, answerId, timeToAnswer } = await req.json();
    
    if (!questionId || timeToAnswer === undefined) {
      return NextResponse.json(
        { error: "Question ID and time to answer are required" },
        { status: 400 }
      );
    }
    
    // Record the answer
    const participantAnswer = await recordParticipantAnswer(
      participant.id,
      questionId,
      answerId,
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
        answerId,
        timeToAnswer,
      }
    );
    
    return NextResponse.json({ 
      success: true,
      participantAnswer 
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
