'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JSX } from 'react';

interface Participant {
    id: number | string;
    username: string;
    score: number;
}

interface GameSidebarProps {
    participants: Participant[];
    gameState: 'lobby' | 'waiting' | 'question' | 'results' | 'conclusion';
}

export const GameSidebar = ({
    participants,
    gameState,
}: GameSidebarProps): JSX.Element => {
    const sortedByScore = [...participants].sort((a, b) => b.score - a.score);
    const sortedByName = [...participants].sort((a, b) =>
        a.username.localeCompare(b.username),
    );

    return (
        <Tabs defaultValue="leaderboard" className="sticky top-20">
            <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="leaderboard">leaderboard</TabsTrigger>
                <TabsTrigger value="participants">
                    participants ({participants.length})
                </TabsTrigger>
            </TabsList>
            <TabsContent value="leaderboard">
                <Card>
                    <CardHeader>
                        <CardTitle>live leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {participants.length > 0 ? (
                            <div className="space-y-2">
                                {sortedByScore
                                    .slice(0, 10) // Show top 10
                                    .map((participant, index) => (
                                        <div
                                            key={participant.id}
                                            className={`p-3 border rounded-md flex justify-between items-center text-sm
                        ${index === 0 && gameState !== 'lobby' ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600' : ''}`}
                                        >
                                            <div className="font-medium">
                                                {index + 1}.{' '}
                                                {participant.username}
                                            </div>
                                            <div className="font-semibold">
                                                {participant.score} pts
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-muted-foreground">
                                no participants yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="participants">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            all participants ({participants.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {participants.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {sortedByName.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className="p-3 border rounded-md flex justify-between items-center text-sm"
                                    >
                                        <div>{participant.username}</div>
                                        {gameState !== 'lobby' && (
                                            <div className="text-xs text-muted-foreground">
                                                {participant.score} pts
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-muted-foreground">
                                no participants have joined yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};
