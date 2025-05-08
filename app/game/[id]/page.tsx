"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher-client";
import { useGameTimer } from "@/hooks/game-timer";

export default function GamePage() {
  const params = useParams<{ id: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [gameState, setGameState] = useState<
    "waiting" | "question" | "results" | "conclusion"
  >("waiting");
  const [_quiz, setQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [_currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [initialTimeToAnswer, setInitialTimeToAnswer] = useState(30);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [openAnswer, setOpenAnswer] = useState("");
  const [results, setResults] = useState<any>(null);
  const [conclusion, setConclusion] = useState<any>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<boolean>(false);
  const [serverStartTime, setServerStartTime] = useState<string | null>(null);
  const router = useRouter();

  // Replace timeLeft state with the hook result
  const timeLeft = useGameTimer(serverStartTime, initialTimeToAnswer);

  useEffect(() => {
    // Get participant token from localStorage
    const storedToken = localStorage.getItem("participant_token");
    const storedLobbyId = localStorage.getItem("lobby_id");

    if (!storedToken || storedLobbyId !== params.id) {
      // Redirect to home if no token or wrong lobby
      router.push("/");
      return;
    }

    setToken(storedToken);

    // Set up Pusher channels
    const pusherClient = getPusherClient();
    const gameChannel = pusherClient.subscribe(CHANNELS.game(params.id));

    // Listen for game start
    gameChannel.bind(EVENTS.GAME_STARTED, (data: any) => {
      if (data.quiz && !data.hostView) {
        setQuiz(data.quiz);
        setGameState("waiting"); // Wait for the first question
      }
    });

    // Listen for new questions
    gameChannel.bind(EVENTS.QUESTION_STARTED, (data: any) => {
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      setInitialTimeToAnswer(data.timeToAnswer || 30);
      setSelectedAnswers([]);
      setOpenAnswer("");
      setSubmittedAnswer(false);
      setGameState("question");

      // Save server start time for synchronized countdown
      if (data.serverStartTime) {
        setServerStartTime(data.serverStartTime);
      }
    });

    // Listen for question ending
    gameChannel.bind(EVENTS.QUESTION_ENDED, (data: any) => {
      setGameState("results");
      setResults({
        correctAnswers: data.correctAnswers,
        isLastQuestion: data.isLastQuestion,
      });

      // After a few seconds, go back to waiting for the next question
      setTimeout(() => {
        if (data.isLastQuestion) {
          // If it was the last question, stay at results until GAME_ENDED is received
        } else {
          setGameState("waiting");
        }
      }, 5000);
    });

    // Listen for game end
    gameChannel.bind(EVENTS.GAME_ENDED, (data: any) => {
      setGameState("conclusion");
      setConclusion({
        rank: data.yourRank,
        score: data.yourScore,
        totalParticipants: data.totalParticipants,
        topPlayers: data.topPlayers || [],
      });
    });

    // Clean up on unmount
    return () => {
      pusherClient.unsubscribe(CHANNELS.game(params.id));
    };
  }, [params.id, router]);

  // Monitor timeLeft to auto-submit when time runs out
  useEffect(() => {
    if (gameState === "question" && timeLeft <= 0 && !submittedAnswer) {
      handleTimedOut();
    }
  }, [timeLeft, gameState, submittedAnswer]);

  // Handle answer selection
  const handleAnswerSelect = (answerId: number) => {
    if (submittedAnswer) return;

    if (currentQuestion?.questionType === "MULTIPLE_CHOICE") {
      // For multiple choice, toggle the selected answer
      setSelectedAnswers((prev) =>
        prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId]
      );
    } else {
      // For single choice, replace the selected answer
      setSelectedAnswers([answerId]);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (submittedAnswer) return;

    try {
      setSubmittedAnswer(true);

      // Prepare the answers data
      let answerId = null;
      if (currentQuestion?.questionType === "OPEN_ENDED") {
        // For open-ended questions, we'll send the text response
        // We'd handle this differently in a real app
      } else if (selectedAnswers.length > 0) {
        // For single choice, use the first (and only) answer
        if (
          currentQuestion?.questionType === "SINGLE_CHOICE" ||
          currentQuestion?.questionType === "TRUE_FALSE"
        ) {
          answerId = selectedAnswers[0];
        } else {
          // For multiple choice, we need special handling
          // For simplicity, just sending the first selected answer
          answerId = selectedAnswers[0];
        }
      }

      // Submit the answer to the server
      const response = await fetch(`/api/lobbies/${params.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerId: answerId,
          timeToAnswer: initialTimeToAnswer - timeLeft,
          openAnswer:
            currentQuestion?.questionType === "OPEN_ENDED"
              ? openAnswer
              : undefined,
        }),
      });

      if (!response.ok) {
        console.error("Failed to submit answer:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // Handle timeout - no answer submitted in time
  const handleTimedOut = async () => {
    if (submittedAnswer) return;

    try {
      setSubmittedAnswer(true);

      // Submit a timeout to the server
      const response = await fetch(`/api/lobbies/${params.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerId: null,
          timeToAnswer: initialTimeToAnswer,
          timedOut: true,
        }),
      });

      if (!response.ok) {
        console.error("Failed to submit timeout:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting timeout:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted p-4">
      <div className="flex-1 flex items-center justify-center">
        {gameState === "waiting" && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-12">
              <h2 className="text-2xl font-bold mb-4">
                waiting for the next question
              </h2>
              <div className="animate-pulse flex justify-center">
                <div className="h-4 w-4 bg-primary rounded-full mx-1"></div>
                <div className="h-4 w-4 bg-primary rounded-full mx-1 animate-pulse delay-150"></div>
                <div className="h-4 w-4 bg-primary rounded-full mx-1 animate-pulse delay-300"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === "question" && currentQuestion && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">time remaining</div>
                  <div className="text-sm font-medium">{timeLeft}s</div>
                </div>
                <Progress value={(timeLeft / initialTimeToAnswer) * 100} />
              </div>

              <h2 className="text-xl font-bold mb-6">
                {currentQuestion.questionText}
              </h2>

              {currentQuestion.questionType === "OPEN_ENDED" ? (
                <div className="space-y-4">
                  <Input
                    value={openAnswer}
                    onChange={(e) => setOpenAnswer(e.target.value)}
                    placeholder="Type your answer here"
                    disabled={submittedAnswer}
                  />
                  <Button
                    className="w-full"
                    onClick={handleSubmitAnswer}
                    disabled={!openAnswer.trim() || submittedAnswer}
                  >
                    {submittedAnswer ? "Answer Submitted" : "Submit Answer"}
                  </Button>
                </div>
              ) : currentQuestion.questionType === "SINGLE_CHOICE" ||
                currentQuestion.questionType === "TRUE_FALSE" ? (
                <div className="space-y-4">
                  <RadioGroup
                    value={selectedAnswers[0]?.toString()}
                    onValueChange={(value) =>
                      handleAnswerSelect(Number.parseInt(value))
                    }
                    disabled={submittedAnswer}
                  >
                    {currentQuestion.answers.map((answer: any) => (
                      <div
                        key={answer.id}
                        className="flex items-center space-x-2 p-3 border rounded-md"
                      >
                        <RadioGroupItem
                          value={answer.id.toString()}
                          id={`answer-${answer.id}`}
                          disabled={submittedAnswer}
                        />
                        <Label
                          htmlFor={`answer-${answer.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {answer.answerText}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button
                    className="w-full"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswers.length === 0 || submittedAnswer}
                  >
                    {submittedAnswer ? "Answer Submitted" : "Submit Answer"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQuestion.answers.map((answer: any) => (
                    <div
                      key={answer.id}
                      className="flex items-center space-x-2 p-3 border rounded-md"
                    >
                      <Checkbox
                        id={`answer-${answer.id}`}
                        checked={selectedAnswers.includes(answer.id)}
                        onCheckedChange={() => handleAnswerSelect(answer.id)}
                        disabled={submittedAnswer}
                      />
                      <Label
                        htmlFor={`answer-${answer.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {answer.answerText}
                      </Label>
                    </div>
                  ))}
                  <Button
                    className="w-full"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswers.length === 0 || submittedAnswer}
                  >
                    {submittedAnswer ? "Answer Submitted" : "Submit Answer"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {gameState === "results" && results && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-8">
              <div className="text-2xl font-bold mb-4">question ended</div>

              {results.correctAnswers && (
                <div className="mb-4">
                  the correct answer was:
                  <span className="font-bold block mt-2">
                    {results.correctAnswers
                      .map((a: any) => a.answerText)
                      .join(", ")}
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
        )}

        {gameState === "conclusion" && conclusion && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center py-8">
              <h2 className="text-2xl font-bold mb-6">game conclusion</h2>

              <div className="mb-6">
                <div className="text-lg">
                  your rank:{" "}
                  <span className="font-bold">
                    {conclusion.rank}/{conclusion.totalParticipants}
                  </span>
                </div>
                <div className="text-lg">
                  your score:{" "}
                  <span className="font-bold">{conclusion.score}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">top players</h3>
              <div className="space-y-2">
                {conclusion.topPlayers.map((player: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-md flex justify-between items-center ${player.isYou ? "bg-muted" : ""}`}
                  >
                    <div className="font-medium">
                      {index + 1}. {player.username} {player.isYou && "(You)"}
                    </div>
                    <div>{player.score} points</div>
                  </div>
                ))}
              </div>

              <Button className="mt-8 w-full" onClick={() => router.push("/")}>
                return to home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
