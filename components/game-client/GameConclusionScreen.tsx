'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface TopPlayer {
    username: string;
    score: number;
    isYou?: boolean;
}

interface ConclusionData {
    rank: number;
    score: number;
    totalParticipants: number;
    topPlayers: TopPlayer[];
}

interface GameConclusionScreenProps {
    conclusion: ConclusionData;
}

export const GameConclusionScreen = ({
    conclusion,
}: GameConclusionScreenProps) => {
    const router = useRouter();

    return (
        <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-8">
                <h2 className="text-2xl font-bold mb-6">game conclusion</h2>

                <div className="mb-6">
                    <div className="text-lg">
                        your rank:{' '}
                        <span className="font-bold">
                            {conclusion.rank}/{conclusion.totalParticipants}
                        </span>
                    </div>
                    <div className="text-lg">
                        your score:{' '}
                        <span className="font-bold">{conclusion.score}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-4">top players</h3>
                <div className="space-y-2">
                    {conclusion.topPlayers.map((player, index) => (
                        <div
                            key={index} // Consider a more stable key if available
                            className={`p-3 border rounded-md flex justify-between items-center ${player.isYou ? 'bg-muted font-semibold' : ''}`}
                        >
                            <div className="font-medium">
                                {index + 1}. {player.username}{' '}
                                {player.isYou && '(You)'}
                            </div>
                            <div>{player.score} points</div>
                        </div>
                    ))}
                </div>

                <Button
                    className="mt-8 w-full"
                    onClick={() => router.push('/')}
                >
                    return to home
                </Button>
            </CardContent>
        </Card>
    );
};
