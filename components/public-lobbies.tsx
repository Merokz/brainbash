'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';

interface Lobby {
    id: number;
    joinCode: string;
    quiz: {
        title: string;
    };
    host: {
        username: string;
    };
    _count: {
        participants: number;
    };
}

export const PublicLobbies = (): JSX.Element => {
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        async function fetchLobbies() {
            try {
                const response = await fetch('/api/lobbies');
                const data = await response.json();
                setLobbies(data);
            } catch (error) {
                console.error('Error fetching lobbies:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLobbies();

        // Poll for new lobbies every 5 seconds
        const interval = setInterval(fetchLobbies, 5000);

        return () => clearInterval(interval);
    }, []);

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleJoinLobby = async () => {
        if (!selectedLobby || !username.trim()) return;

        try {
            const response = await fetch('/api/lobbies/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    joinCode: selectedLobby.joinCode,
                    username,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Store participant token in localStorage
                localStorage.setItem('participant_token', data.token);
                localStorage.setItem('lobby_id', data.lobby.id.toString());

                // Redirect to game page
                router.push(`/game/${data.lobby.id}`);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to join lobby');
            }
        } catch (error) {
            console.error('Error joining lobby:', error);
            alert('An error occurred while joining the lobby');
        }
    };

    return (
        <Card id="join-game">
            <CardHeader>
                <CardTitle>public games</CardTitle>
                <CardDescription>
                    join an ongoing public quiz game
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : lobbies.length > 0 ? (
                    <div className="space-y-4">
                        {lobbies.map((lobby) => (
                            <div
                                key={lobby.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                                onClick={() => {
                                    setSelectedLobby(lobby);
                                    setDialogOpen(true);
                                }}
                            >
                                <div>
                                    <h3 className="font-medium">
                                        {lobby.quiz.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        hosted by {lobby.host.username}
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {lobby._count.participants} participants
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        no public games available at the moment
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                join {selectedLobby?.quiz.title}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    enter your username
                                </Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="your display name"
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleJoinLobby}
                                disabled={!username.trim()}
                            >
                                join game
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};
