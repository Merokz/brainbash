import { getUserById, updateUser } from '@/lib/commands';
import { NextResponse } from 'next/server';

export const PUT = async (
    request: Request,
    props: { params: Promise<{ id: string }> },
): Promise<any> => {
    const params = await props.params;
    try {
        console.log(params);
        const user = await getUserById(parseInt(params.id));
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }
        const { username, email } = await request.json();

        const newUser = updateUser(user.id, username, email);
        return NextResponse.json(newUser);
    } catch (error) {
        console.error('Error updating quiz:', error);
        return NextResponse.json(
            { error: 'Failed to update quiz' },
            { status: 500 },
        );
    }
};
