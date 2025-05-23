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
  isLoadingAction?: boolean; // Added
}

export function GameWaitingCard({
  quizTitle,
  participantsCount,
  questionsCount,
  currentQuestionIndex,
  onStartQuestion,
  onEndGame,
  isLoadingAction, // Added
}: GameWaitingCardProps) {
  if (currentQuestionIndex === -1) {
    // Game Starting Soon
    return (
      <Card>
        <CardHeader>
          <CardTitle>game starting soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            the quiz "{quizTitle}" is about to begin with {participantsCount} participants.
            there are {questionsCount} questions.
          </p>
          <div className="flex justify-end">
            <Button onClick={onStartQuestion} size="lg" loading={isLoadingAction} disabled={isLoadingAction}> {/* Modified */}
              start first question
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
          <CardTitle>ready for next question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            question {currentQuestionIndex + 1} completed. ready to proceed to question {currentQuestionIndex + 2}.
          </p>
          <div className="flex justify-end">
            <Button onClick={onStartQuestion} loading={isLoadingAction} disabled={isLoadingAction}> {/* Modified */}
              start next question
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
        <CardTitle>all questions answered!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6">
          all {questionsCount} questions have been completed.
        </p>
        <div className="flex justify-end">
          <Button onClick={onEndGame} loading={isLoadingAction} disabled={isLoadingAction}> {/* Modified */}
            show final results
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}