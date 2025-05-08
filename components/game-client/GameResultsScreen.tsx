"use client";

import { Card, CardContent } from "@/components/ui/card";

interface CorrectAnswer {
  answerText: string;
}

interface ResultsData {
  correctAnswers?: CorrectAnswer[];
  isLastQuestion: boolean;
}

interface GameResultsScreenProps {
  results: ResultsData;
}

export function GameResultsScreen({ results }: GameResultsScreenProps) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 text-center py-8">
        <div className="text-2xl font-bold mb-4">
          question ended
        </div>
        
        {results.correctAnswers && results.correctAnswers.length > 0 && (
          <div className="mb-4">
            the correct answer{results.correctAnswers.length > 1 ? 's were' : ' was'}: 
            <span className="font-bold block mt-2">
              {results.correctAnswers.map((a) => a.answerText).join(", ")}
            </span>
          </div>
        )}
        
        <div className="mt-6 text-sm text-muted-foreground">
          {results.isLastQuestion 
            ? "Finalizing game results..." 
            : "Next question coming up..."}
        </div>
      </CardContent>
    </Card>
  );
}
