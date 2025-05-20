'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { JSX } from 'react';

// Define types
interface Answer {
    id: number | string;
    answerText: string;
    isCorrect: boolean;
}

interface Question {
    questionText: string;
    image?: string | null;
    answers: Answer[];
}

export interface ParticipantAnswer {
    participantId: number;
    questionId: number;
    answerId: number | string | null; // Allow string if IDs can be strings
    timeToAnswer: number;
}

interface QuestionResultsCardProps {
    question: Question;
    questionNumber: number;
    participantAnswers: ParticipantAnswer[];
    isLastQuestion: boolean;
    onNextAction: () => void; // Handles "Next Question" or "Show Final Results"
}

export const QuestionResultsCard = ({
    question,
    questionNumber,
    participantAnswers,
    isLastQuestion,
    onNextAction,
}: QuestionResultsCardProps): JSX.Element => {
    const totalValidAnswers = participantAnswers.filter(
        (pa) => pa.answerId !== null,
    ).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>results: question {questionNumber}</CardTitle>
            </CardHeader>
            <CardContent>
                {question.image && (
                    <div className="my-4 flex justify-center">
                        <Image
                            src={question.image}
                            alt="Question image"
                            width={300}
                            height={200}
                            className="rounded-md object-contain"
                        />
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-6">
                    {question.questionText}
                </h2>

                <div className="space-y-3 mb-8">
                    {question.answers.map((answer) => {
                        const answerCount = participantAnswers.filter(
                            (pa) => pa.answerId === answer.id,
                        ).length;
                        const percentage = Math.round(
                            (answerCount / Math.max(1, totalValidAnswers)) *
                                100,
                        );

                        return (
                            <div
                                key={answer.id}
                                className="p-3 border rounded-lg"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span
                                        className={`text-lg ${answer.isCorrect ? 'font-semibold text-green-700 dark:text-green-400' : ''}`}
                                    >
                                        {answer.answerText}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {answerCount}{' '}
                                        {answerCount === 1 ? 'vote' : 'votes'} (
                                        {percentage}%)
                                    </span>
                                </div>
                                <Progress
                                    value={percentage}
                                    className={`${answer.isCorrect ? 'bg-green-500' : ''}`}
                                />
                                {answer.isCorrect && (
                                    <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                                        correct answer
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="mt-4 text-sm text-muted-foreground">
                        total answers recorded for this question:{' '}
                        {totalValidAnswers}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onNextAction} size="lg">
                        {isLastQuestion ? (
                            'Show Final Results'
                        ) : (
                            <>
                                next question
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
