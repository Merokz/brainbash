"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Answer {
  id: number;
  answerText: string;
}

interface Question {
  id: number;
  questionText: string;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "OPEN_ENDED";
  answers: Answer[];
}

interface GameQuestionScreenProps {
  question: Question;
  timeLeft: number;
  initialTimeToAnswer: number;
  selectedAnswers: number[];
  openAnswer: string;
  submittedAnswer: boolean;
  onAnswerSelect: (answerId: number) => void;
  onOpenAnswerChange: (value: string) => void;
  onSubmitAnswer: () => void;
}

export function GameQuestionScreen({
  question,
  timeLeft,
  initialTimeToAnswer,
  selectedAnswers,
  openAnswer,
  submittedAnswer,
  onAnswerSelect,
  onOpenAnswerChange,
  onSubmitAnswer,
}: GameQuestionScreenProps) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">time remaining</div>
            <div className="text-sm font-medium">{Math.ceil(timeLeft)}s</div>
          </div>
          <Progress value={initialTimeToAnswer > 0 ? (timeLeft / initialTimeToAnswer) * 100 : 0} />
        </div>

        <h2 className="text-xl font-bold mb-6">{question.questionText}</h2>

        {question.questionType === "OPEN_ENDED" ? (
          <div className="space-y-4">
            <Input
              value={openAnswer}
              onChange={(e) => onOpenAnswerChange(e.target.value)}
              placeholder="Type your answer here"
              disabled={submittedAnswer}
            />
          </div>
        ) : question.questionType === "SINGLE_CHOICE" || question.questionType === "TRUE_FALSE" ? (
          <RadioGroup
            value={selectedAnswers[0]?.toString()}
            onValueChange={(value) => onAnswerSelect(Number.parseInt(value))}
            disabled={submittedAnswer}
            className="space-y-2"
          >
            {question.answers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-2 p-3 border rounded-md has-[:disabled]:opacity-70 has-[:disabled]:cursor-not-allowed">
                <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} disabled={submittedAnswer} />
                <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                  {answer.answerText}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : ( // MULTIPLE_CHOICE
          <div className="space-y-2">
            {question.answers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-2 p-3 border rounded-md has-[:disabled]:opacity-70 has-[:disabled]:cursor-not-allowed">
                <Checkbox
                  id={`answer-${answer.id}`}
                  checked={selectedAnswers.includes(answer.id)}
                  onCheckedChange={() => onAnswerSelect(answer.id)}
                  disabled={submittedAnswer}
                />
                <Label htmlFor={`answer-${answer.id}`} className="flex-1 cursor-pointer">
                  {answer.answerText}
                </Label>
              </div>
            ))}
          </div>
        )}
        <Button 
          className="w-full mt-6" 
          onClick={onSubmitAnswer} 
          disabled={
            (question.questionType === "OPEN_ENDED" ? !openAnswer.trim() : selectedAnswers.length === 0) || 
            submittedAnswer
          }
        >
          {submittedAnswer ? "Answer Submitted" : "Submit Answer"}
        </Button>
      </CardContent>
    </Card>
  );
}
