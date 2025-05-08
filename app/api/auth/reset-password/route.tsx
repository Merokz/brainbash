// /api/auth/reset-password.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { updatePassword } from '@/lib/commands';

const JWT_SECRET = process.env.JWT_SECRET!;

export const POST = async (req: NextRequest): Promise<any> => {
    const { token, password } = await req.json();

    if (!token || !password) {
        return NextResponse.json(
            { error: 'Missing token or password.' },
            { status: 400 },
        );
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            email: string;
            purpose: string;
        };

        if (decoded.purpose !== 'password-reset') {
            return NextResponse.json(
                { error: 'Invalid token purpose.' },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await updatePassword(decoded.email, hashedPassword);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Reset password error:', err);
        return NextResponse.json(
            { error: 'Invalid or expired token.' },
            { status: 400 },
        );
    }
};
