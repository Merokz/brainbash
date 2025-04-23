"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function GamePreview() {
  const [timeLeft] = useState(20)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-muted p-4">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Time remaining</div>
                <div className="text-sm font-medium">{timeLeft}s</div>
              </div>
              <Progress value={(timeLeft / 30) * 100} />
            </div>

            <h2 className="text-xl font-bold mb-6">What is the capital of France?</h2>

            <div className="space-y-4">
              <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer}>
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <RadioGroupItem value="1" id="answer-1" />
                  <Label htmlFor="answer-1" className="flex-1 cursor-pointer">
                    London
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <RadioGroupItem value="2" id="answer-2" />
                  <Label htmlFor="answer-2" className="flex-1 cursor-pointer">
                    Paris
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <RadioGroupItem value="3" id="answer-3" />
                  <Label htmlFor="answer-3" className="flex-1 cursor-pointer">
                    Berlin
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <RadioGroupItem value="4" id="answer-4" />
                  <Label htmlFor="answer-4" className="flex-1 cursor-pointer">
                    Madrid
                  </Label>
                </div>
              </RadioGroup>
              <Button className="w-full" disabled={!selectedAnswer}>
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
