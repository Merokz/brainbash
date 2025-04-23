"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function CreateQuizPreview() {
  const [activeTab, setActiveTab] = useState("details")

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
        <p className="text-muted-foreground">Create a new quiz with questions and answers</p>
      </div>

      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Quiz Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input id="title" placeholder="Enter quiz title" defaultValue="General Knowledge Quiz" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter quiz description"
                      rows={4}
                      defaultValue="A quiz covering various general knowledge topics"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="public" defaultChecked />
                    <Label htmlFor="public">Make this quiz public</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("questions")}>Next: Add Questions</Button>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea placeholder="Enter your question" rows={2} defaultValue="What is the capital of France?" />
                </div>

                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select defaultValue="SINGLE_CHOICE">
                    <SelectTrigger>
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
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroup defaultValue="1" className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="answer-0" />
                      </RadioGroup>
                      <Input defaultValue="London" placeholder="Answer 1" className="flex-1" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroup defaultValue="1" className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="answer-1" />
                      </RadioGroup>
                      <Input defaultValue="Paris" placeholder="Answer 2" className="flex-1" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroup defaultValue="1" className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="answer-2" />
                      </RadioGroup>
                      <Input defaultValue="Berlin" placeholder="Answer 3" className="flex-1" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroup defaultValue="1" className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="answer-3" />
                      </RadioGroup>
                      <Input defaultValue="Madrid" placeholder="Answer 4" className="flex-1" />
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      + Add Answer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full py-8">
              + Add Another Question
            </Button>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back to Details
              </Button>

              <Button>Create Quiz</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
