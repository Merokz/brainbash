import { NextRequest, NextResponse } from 'next/server';
import { getLobbyById } from '@/lib/commands';

export const GET = async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<any> => {
    try {
        // We'll allow accessing the lobby even without authentication
        // but we'll include user info if they're authenticated

        // In Next.js App Router, params should be properly accessed
        const { id } = await params;

        const lobbyId = Number(id);
        if (isNaN(lobbyId)) {
            return NextResponse.json(
                { error: 'Invalid lobby ID' },
                { status: 400 },
            );
        }

        const lobby = await getLobbyById(lobbyId);

        if (!lobby) {
            return NextResponse.json(
                { error: 'Lobby not found' },
                { status: 404 },
            );
        }

        // If we get here, the lobby exists
        return NextResponse.json(lobby);
    } catch (error) {
        console.error('Error fetching lobby:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lobby' },
            { status: 500 },
        );
    }
};
