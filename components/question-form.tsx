"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X } from "lucide-react"

interface Question {
  id?: number
  questionText: string
  image: string | null
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SINGLE_CHOICE" | "OPEN_ENDED"
  answers: Answer[]
}

interface Answer {
  id?: number
  answerText: string
  isCorrect: boolean
}

interface QuestionFormProps {
  question: Question
  index: number
  onChange: (question: Question) => void
  onRemove: () => void
}

export function QuestionForm({ question, index, onChange, onRemove }: QuestionFormProps) {
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...question,
      questionText: e.target.value,
    })
  }

  const handleQuestionTypeChange = (value: string) => {
    let newAnswers: Answer[] = []

    if (value === "MULTIPLE_CHOICE") {
      newAnswers = [
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
      ]
    } else if (value === "SINGLE_CHOICE") {
      newAnswers = [
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
      ]
    } else if (value === "TRUE_FALSE") {
      newAnswers = [
        { answerText: "True", isCorrect: false },
        { answerText: "False", isCorrect: false },
      ]
    } else if (value === "OPEN_ENDED") {
      newAnswers = [{ answerText: "", isCorrect: true }]
    }

    onChange({
      ...question,
      questionType: value as any,
      answers: newAnswers,
    })
  }

  const handleAnswerTextChange = (index: number, text: string) => {
    const newAnswers = [...question.answers]
    newAnswers[index] = {
      ...newAnswers[index],
      answerText: text,
    }

    onChange({
      ...question,
      answers: newAnswers,
    })
  }

  const handleAnswerCorrectChange = (index: number, isCorrect: boolean) => {
    const newAnswers = [...question.answers]

    if (question.questionType === "SINGLE_CHOICE" || question.questionType === "TRUE_FALSE") {
      // For single choice, only one answer can be correct
      newAnswers.forEach((answer, i) => {
        newAnswers[i] = {
          ...answer,
          isCorrect: i === index ? isCorrect : false,
        }
      })
    } else {
      newAnswers[index] = {
        ...newAnswers[index],
        isCorrect,
      }
    }

    onChange({
      ...question,
      answers: newAnswers,
    })
  }

  const addAnswer = () => {
    if (question.questionType === "OPEN_ENDED" || question.questionType === "TRUE_FALSE") {
      return
    }

    onChange({
      ...question,
      answers: [...question.answers, { answerText: "", isCorrect: false }],
    })
  }

  const removeAnswer = (index: number) => {
    if (question.answers.length <= 2) {
      return
    }

    onChange({
      ...question,
      answers: question.answers.filter((_, i) => i !== index),
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Question {index + 1}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${index}`}>Question Text</Label>
          <Textarea
            id={`question-${index}`}
            value={question.questionText}
            onChange={handleQuestionTextChange}
            placeholder="Enter your question"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`question-type-${index}`}>Question Type</Label>
          <Select value={question.questionType} onValueChange={handleQuestionTypeChange}>
            <SelectTrigger id={`question-type-${index}`}>
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
              <SelectItem value="TRUE_FALSE">True/False</SelectItem>
              <SelectItem value="OPEN_ENDED">Open Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Answers</Label>

          {question.questionType === "OPEN_ENDED" ? (
            <div className="p-4 border rounded-md">
              <p className="text-sm text-muted-foreground">
                For open-ended questions, participants will provide their own text answer. Enter the correct answer text
                below:
              </p>
              <Input
                className="mt-2"
                value={question.answers[0]?.answerText || ""}
                onChange={(e) => handleAnswerTextChange(0, e.target.value)}
                placeholder="Correct answer"
              />
            </div>
          ) : question.questionType === "TRUE_FALSE" ? (
            <RadioGroup
              value={question.answers.findIndex((a) => a.isCorrect).toString()}
              onValueChange={(value) => {
                const index = Number.parseInt(value)
                handleAnswerCorrectChange(index, true)
              }}
            >
              {question.answers.map((answer, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={i.toString()} id={`answer-${index}-${i}`} />
                  <Label htmlFor={`answer-${index}-${i}`}>{answer.answerText}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : question.questionType === "SINGLE_CHOICE" ? (
            <div className="space-y-2">
              {question.answers.map((answer, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroup
                    value={question.answers.findIndex((a) => a.isCorrect).toString()}
                    onValueChange={(value) => {
                      const index = Number.parseInt(value)
                      handleAnswerCorrectChange(index, true)
                    }}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={i.toString()} id={`answer-${index}-${i}`} />
                  </RadioGroup>
                  <Input
                    value={answer.answerText}
                    onChange={(e) => handleAnswerTextChange(i, e.target.value)}
                    placeholder={`Answer ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAnswer(i)}
                    disabled={question.answers.length <= 2}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addAnswer} className="w-full" size="sm">
                + Add Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {question.answers.map((answer, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox
                    id={`answer-correct-${index}-${i}`}
                    checked={answer.isCorrect}
                    onCheckedChange={(checked) => handleAnswerCorrectChange(i, !!checked)}
                  />
                  <Input
                    value={answer.answerText}
                    onChange={(e) => handleAnswerTextChange(i, e.target.value)}
                    placeholder={`Answer ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAnswer(i)}
                    disabled={question.answers.length <= 2}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addAnswer} className="w-full" size="sm">
                + Add Answer
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
