'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Participant {
    id: number | string;
    username: string;
    score: number;
}

interface GameConclusionCardProps {
    quizTitle: string;
    participants: Participant[];
    onReturnToHome: () => void;
}

export const GameConclusionCard = ({
    quizTitle,
    participants,
    onReturnToHome,
}: GameConclusionCardProps) => {
    const sortedParticipants = [...participants].sort(
        (a, b) => b.score - a.score,
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl">quiz over!</CardTitle>
                <CardDescription>
                    here are the final results for "{quizTitle}".
                </CardDescription>
            </CardHeader>
            <CardContent>
                <h2 className="text-2xl font-bold mb-6 text-center">
                    final leaderboard
                </h2>
                <div className="space-y-3 mb-8 max-w-md mx-auto">
                    {sortedParticipants.map((participant, index) => (
                        <div
                            key={participant.id}
                            className={`p-4 border rounded-lg flex justify-between items-center shadow-sm
                ${
                    index === 0
                        ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600 ring-2 ring-yellow-500'
                        : index === 1
                          ? 'bg-slate-50 border-slate-300 dark:bg-slate-800/30 dark:border-slate-600'
                          : index === 2
                            ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/40 dark:border-orange-700'
                            : 'bg-card'
                }`} // Use bg-card for default
                        >
                            <div className="flex items-center">
                                <span
                                    className={`text-lg font-bold w-8 text-center ${
                                        index === 0
                                            ? 'text-yellow-600'
                                            : index === 1
                                              ? 'text-slate-600'
                                              : index === 2
                                                ? 'text-orange-600'
                                                : ''
                                    }`}
                                >
                                    {index + 1}.
                                </span>
                                <span className="text-xl font-medium">
                                    {participant.username}
                                </span>
                            </div>
                            <div
                                className={`text-xl font-bold ${index === 0 ? 'text-yellow-700' : ''}`}
                            >
                                {participant.score} pts {index === 0 && '👑'}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center">
                    <Button
                        onClick={onReturnToHome}
                        size="lg"
                        variant="default"
                    >
                        return to home
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
