'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/sonner';
import Avatar from 'boring-avatars';
import { JSX, useEffect, useState } from 'react';

export const ProfilePage = (): JSX.Element => {
    const [user, setUser] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const fetchUser = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setUsername(data.username);
                setEmail(data.email);
            }
        };

        fetchUser();
    }, []);

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleSave = async () => {
        const res = await fetch(`/api/users/edit/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email }),
        });

        if (res.ok) {
            showToast('changes saved successfully!', true);
        } else {
            alert('failed to update user!');
        }
    };

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleForgotPassword = async () => {
        try {
            const email = user.email;
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), // ✅ only send the email now
            });

            if (response.ok) {
                setSuccess(
                    "If this email exists, we've sent instructions to reset your password.",
                );
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setError('An unexpected error occurred');
        }
    };

    return (
        <main className="flex justify-center items-center min-h-screen p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="w-full text-center">
                    <CardTitle>your profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="w-full flex justify-center">
                        <Avatar
                            name={username}
                            colors={[
                                '#152e57',
                                '#11235d',
                                '#660e44',
                                '#aa0600',
                                '#e06800',
                            ]}
                            variant="beam"
                            size={128}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">username</Label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            name="username"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="mt-6" htmlFor="email">
                            e-mail
                        </Label>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email"
                            name="email"
                        />
                    </div>
                    <Button className="w-full" onClick={handleSave}>
                        save changes
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleForgotPassword}
                    >
                        request password change
                    </Button>
                    {error && (
                        <div className="text-sm text-red-500">{error}</div>
                    )}
                    {success && (
                        <div className="text-sm text-green-500">{success}</div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
};
