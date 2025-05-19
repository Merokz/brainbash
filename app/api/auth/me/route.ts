import { getUserFromToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const GET = async (): Promise<any> => {
    try {
        const user = await getUserFromToken();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 },
        );
    }
};
