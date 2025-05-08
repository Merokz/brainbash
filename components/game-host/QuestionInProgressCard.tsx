'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';

// Define Question and Answer types based on your data structure
interface Answer {
    id: number | string;
    answerText: string;
    isCorrect: boolean;
}

interface Question {
    questionText: string;
    image?: string | null;
    questionType: string;
    answers: Answer[];
    timeToAnswer: number; // Time limit for this specific question
}

interface QuestionInProgressCardProps {
    question: Question;
    questionNumber: number;
    timeLeft: number;
    answeredCount: number;
    totalParticipants: number;
    onEndQuestionEarly: () => void;
}

export const QuestionInProgressCard = ({
    question,
    questionNumber,
    timeLeft,
    answeredCount,
    totalParticipants,
    onEndQuestionEarly,
}: QuestionInProgressCardProps) => {
    const timeLimit = question.timeToAnswer; // Use timeToAnswer from the question object

    return (
        <Card>
            <CardHeader>
                <CardTitle>question {questionNumber}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">
                            time remaining
                        </div>
                        <div className="text-sm font-medium">
                            {Math.ceil(timeLeft)}s
                        </div>
                    </div>
                    <Progress
                        value={timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0}
                    />
                </div>

                <h2 className="text-xl font-semibold mb-2">
                    type: {question.questionType}
                </h2>
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

                <div className="space-y-3">
                    {question.answers.map((answer) => (
                        <div
                            key={answer.id}
                            className={`p-4 border rounded-lg flex justify-between items-center text-left
                ${answer.isCorrect ? 'border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/30 ring-2 ring-green-500' : 'border-gray-300 dark:border-gray-700'}`}
                        >
                            <span className="text-lg">{answer.answerText}</span>
                            {answer.isCorrect && (
                                <span className="text-xs font-semibold uppercase text-green-600 dark:text-green-400 px-2 py-1 bg-green-200 dark:bg-green-800 rounded-full">
                                    correct
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground flex items-center">
                        <AlertCircle className="h-4 w-4 inline mr-1.5" />
                        waiting for participants to answer... ({answeredCount}/
                        {totalParticipants} answered)
                    </div>
                    <Button
                        variant="outline"
                        onClick={onEndQuestionEarly}
                        disabled={timeLeft <= 0}
                    >
                        end question early
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
