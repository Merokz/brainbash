"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface GameWaitingCardProps {
  quizTitle: string;
  participantsCount: number;
  questionsCount: number;
  currentQuestionIndex: number; // -1 for "Game Starting Soon"
  onStartQuestion: () => void;
  onEndGame: () => void;
}

export function GameWaitingCard({
  quizTitle,
  participantsCount,
  questionsCount,
  currentQuestionIndex,
  onStartQuestion,
  onEndGame,
}: GameWaitingCardProps) {
  if (currentQuestionIndex === -1) {
    // Game Starting Soon
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Starting Soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            The quiz "{quizTitle}" is about to begin with {participantsCount} participants.
            There are {questionsCount} questions.
          </p>
          <div className="flex justify-end">
            <Button onClick={onStartQuestion} size="lg">
              Start First Question
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentQuestionIndex < questionsCount - 1) {
    // Ready for Next Question
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ready for Next Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Question {currentQuestionIndex + 1} completed. Ready to proceed to question {currentQuestionIndex + 2}.
          </p>
          <div className="flex justify-end">
            <Button onClick={onStartQuestion}>
              Start Next Question
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // All Questions Answered, ready for final results
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Questions Answered!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6">
          All {questionsCount} questions have been completed.
        </p>
        <div className="flex justify-end">
          <Button onClick={onEndGame}>
            Show Final Results
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}