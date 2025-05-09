"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionForm } from "./question-form"

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

export function QuizForm({ quiz }: { quiz?: any }) {
  const [title, setTitle] = useState(quiz?.title || "")
  const [description, setDescription] = useState(quiz?.description || "")
  const [isPublic, setIsPublic] = useState(quiz?.isPublic || false)
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || [])
  const [activeTab, setActiveTab] = useState("details")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || "")
      setDescription(quiz.description || "")
      setIsPublic(quiz.isPublic || false)
      setQuestions(quiz.questions || [])
    }
  }, [quiz])

  const addQuestion = () => {
    // Don't allow more than 8 questions
    if (questions.length >= 8) {
      setError("Maximum of 8 questions allowed per quiz")
      return
    }
    
    setQuestions([
      ...questions,
      {
        questionText: "",
        image: null,
        questionType: "MULTIPLE_CHOICE",
        answers: [
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
        ],
      },
    ])
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validate form
    if (!title.trim()) {
      setError("Quiz title is required")
      setActiveTab("details")
      return
    }

    if (questions.length === 0) {
      setError("At least one question is required")
      setActiveTab("questions")
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]

      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text is required`)
        setActiveTab("questions")
        return
      }

      // Check if at least one answer is marked as correct
      if (!q.answers.some((a) => a.isCorrect)) {
        setError(`Question ${i + 1} must have at least one correct answer`)
        setActiveTab("questions")
        return
      }

      // Check if all answers have text
      if (q.answers.some((a) => !a.answerText.trim())) {
        setError(`All answers for question ${i + 1} must have text`)
        setActiveTab("questions")
        return
      }
    }

    setSaving(true)
    setError("")

    try {
      console.log(JSON.stringify({
        title,
        description,
        isPublic,
        questions,
      }));
      const endpoint = quiz?.id ? `/api/quizzes/edit/${quiz.id}` : "/api/quizzes/create"

      const method = quiz?.id ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          isPublic,
          questions,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push("/")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save quiz")
      }
    } catch (error) {
      console.error("Error saving quiz:", error)
      setError("An error occurred while saving the quiz")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">quiz details</TabsTrigger>
          <TabsTrigger value="questions">questions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">quiz title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="enter quiz title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="enter quiz description"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="public">make this quiz public</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setActiveTab("questions")}>next: add questions</Button>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6 pt-4">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <QuestionForm
                key={index}
                question={question}
                index={index}
                onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                onRemove={() => removeQuestion(index)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground mb-4">no questions added yet</p>
                <Button onClick={addQuestion}>add your first question</Button>
              </CardContent>
            </Card>
          )}

          {/* Show add button only if under the limit */}
          {questions.length < 8 ? (
            <Button variant="outline" onClick={addQuestion} className="w-full py-8">
              + add another question ({questions.length}/8)
            </Button>
          ) : (
            <p className="text-center text-amber-600 py-2">
              maximum of 8 questions reached
            </p>
          )}

          {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("details")}>
              back to details
            </Button>

            <Button onClick={handleSubmit} loading={saving} disabled={saving}>
              {quiz?.id ? "update quiz" : "create quiz"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
