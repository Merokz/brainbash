import { NextRequest, NextResponse } from 'next/server';
import {
    addParticipantToLobby,
    getLobbyByJoinCode,
    updateParticipantToken,
} from '@/lib/commands';
import { createParticipantToken, getUserFromToken } from '@/lib/auth';
import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher-service';

export const POST = async (req: NextRequest): Promise<any> => {
    try {
        const { joinCode, username } = await req.json();

        if (!joinCode || !username) {
            return NextResponse.json(
                { error: 'Join code and username are required' },
                { status: 400 },
            );
        }

        // Get the lobby by join code
        const lobby = await getLobbyByJoinCode(joinCode);
        if (!lobby) {
            return NextResponse.json(
                { error: 'Lobby not found' },
                { status: 404 },
            );
        }

        // Check if the game is still in the lobby state
        if (lobby.state !== 'IN_LOBBY') {
            return NextResponse.json(
                { error: 'Game has already started or ended' },
                { status: 400 },
            );
        }

        // Get the current user if they're logged in
        const user = await getUserFromToken();
        const userId = user ? user.id : undefined;

        // Create a participant
        const participant = await addParticipantToLobby(
            lobby.id,
            username,
            userId,
        );

        // Create a participant token
        const token = await createParticipantToken(participant.id, lobby.id);

        // Update the participant with the token
        await updateParticipantToken(participant.id, token);

        // Notify all clients in the lobby that a new participant has joined
        await pusherServer.trigger(
            CHANNELS.lobby(lobby.id.toString()),
            EVENTS.PARTICIPANT_JOINED,
            {
                participant: {
                    id: participant.id,
                    username: participant.username,
                    score: participant.score,
                },
            },
        );

        return NextResponse.json({
            token,
            participant,
            lobby: {
                id: lobby.id,
                joinCode: lobby.joinCode,
                quiz: {
                    title: lobby.quiz.title,
                },
            },
        });
    } catch (error) {
        console.error('Error joining lobby:', error);
        return NextResponse.json(
            { error: 'Failed to join lobby' },
            { status: 500 },
        );
    }
};
