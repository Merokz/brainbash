import { NextRequest, NextResponse } from 'next/server';
import { getParticipantFromToken } from '@/lib/auth';
import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher-service';
import { calculatePoints } from '@/lib/game';
import {
    getLobbyById,
    getQuestionById,
    recordParticipantAnswer,
} from '@/lib/commands';

export const POST = async (
    req: NextRequest,
    props: { params: Promise<{ id: string }> },
): Promise<any> => {
    const params = await props.params;
    try {
        // Get the participant token from the authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const token = authHeader.substring(7);
        const participant = await getParticipantFromToken(token);

        if (!participant || participant.lobbyId !== Number(params.id)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const {
            questionId,
            answerId,
            timeToAnswer: timeTaken,
            timedOut,
        } = await req.json();

        if (!questionId || timeTaken === undefined) {
            return NextResponse.json(
                { error: 'Question ID and time to answer are required' },
                { status: 400 },
            );
        }

        let points = 0;
        let isCorrect = false;

        if (!timedOut && answerId !== null) {
            const question = await getQuestionById(questionId);

            if (question) {
                const submittedAnswer = question.answers.find(
                    (a: { id: number }) => a.id === answerId,
                );
                if (submittedAnswer?.isCorrect) {
                    isCorrect = true;
                }
                const lobby = await getLobbyById(participant.lobbyId);
                const questionTimeLimit = lobby?.timeToAnswer || 30; // Default to 30s if not on lobby

                points = calculatePoints(
                    isCorrect,
                    timeTaken,
                    questionTimeLimit,
                );
            }
        } else if (timedOut) {
            // Points remain 0 for timed-out answers
        }

        // Record the answer
        const participantAnswer = await recordParticipantAnswer(
            participant.id,
            questionId,
            answerId,
            timeTaken,
            points, // Pass calculated points
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
                timeToAnswer: timeTaken,
                pointsAwarded: points, // Optionally send points to host
            },
        );

        return NextResponse.json({
            success: true,
            participantAnswer,
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        // Log the actual error for debugging
        if (error instanceof Error) {
            console.error(error.message);
        }
        return NextResponse.json(
            {
                error: 'Failed to submit answer',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
};
