"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Timer, AlertCircle } from "lucide-react"
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher-client"

export default function GameHostPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [gameState, setGameState] = useState<"waiting" | "question" | "results" | "conclusion">("waiting");
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [participantAnswers, setParticipantAnswers] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Fetch initial data and set up Pusher
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Fetch lobby data with quiz and participants
        const lobbyResponse = await fetch(`/api/lobbies/${params.id}`);
        if (lobbyResponse.ok) {
          const lobbyData = await lobbyResponse.json();
          if (lobbyData.quiz) {
            setQuiz(lobbyData.quiz);
          }
          if (lobbyData.participants) {
            setParticipants(lobbyData.participants);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();

    // Set up Pusher subscriptions
    const pusherClient = getPusherClient();
    
    // Subscribe to lobby channel for participant updates
    const lobbyChannel = pusherClient.subscribe(CHANNELS.lobby(params.id));
    
    // Subscribe to game channel for game events
    const gameChannel = pusherClient.subscribe(CHANNELS.game(params.id));
    
    // Handle participant joining
    lobbyChannel.bind(EVENTS.PARTICIPANT_JOINED, (data: any) => {
      setParticipants(prev => {
        if (prev.some(p => p.id === data.participant.id)) return prev;
        return [...prev, data.participant];
      });
    });
    
    // Handle participant leaving
    lobbyChannel.bind(EVENTS.PARTICIPANT_LEFT, (data: any) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId));
    });
    
    // Handle game started
    lobbyChannel.bind(EVENTS.GAME_STARTED, (data: any) => {
      // As the host, we should receive the full quiz with answers
      if (data.quiz && data.hostView) {
        setQuiz(data.quiz);
        setGameState("waiting");
      }
    });
    
    // Handle answers submitted
    gameChannel.bind(EVENTS.ANSWER_SUBMITTED, (data: any) => {
      setParticipantAnswers(prev => [...prev, data]);
      
      // Update participant score
      setParticipants(prev => 
        prev.map(p => 
          p.id === data.participantId 
            ? { ...p, score: data.newScore } 
            : p
        )
      );
    });

    return () => {
      // Clean up Pusher subscriptions
      pusherClient.unsubscribe(CHANNELS.lobby(params.id));
      pusherClient.unsubscribe(CHANNELS.game(params.id));
      
      // Clear any active timers
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [params.id]);

  // Start the timer for a question
  const startTimer = (duration: number) => {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTimeLeft(duration);
    setQuestionStartTime(Date.now());
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - show results
          clearInterval(timerRef.current!);
          handleQuestionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle starting a new question
  const handleStartQuestion = async () => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length - 1) {
      // No more questions, end the game
      handleEndGame();
      return;
    }
    
    // Move to next question
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);
    setGameState("question");
    setParticipantAnswers([]);
    
    // Get question details
    const question = quiz.questions[newIndex];
    const timeToAnswer = question.timeToAnswer || 30; // Default to 30 seconds
    
    try {
      // Notify server to start the question
      const response = await fetch(`/api/lobbies/${params.id}/question/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          questionIndex: newIndex,
          timeToAnswer
        })
      });
      
      if (!response.ok) {
        console.error("Failed to start question:", await response.text());
        return;
      }
      
      // Start local timer
      startTimer(timeToAnswer);
      
    } catch (error) {
      console.error("Error starting question:", error);
    }
  };
  
  // Handle question timeout - show results when timer reaches 0
  const handleQuestionTimeout = async () => {
    if (gameState !== "question") return;
    
    setGameState("results");
    
    try {
      // Notify server that the question time is up
      const response = await fetch(`/api/lobbies/${params.id}/question/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          questionIndex: currentQuestionIndex,
        })
      });
      
      if (!response.ok) {
        console.error("Failed to end question:", await response.text());
      }
      
    } catch (error) {
      console.error("Error ending question:", error);
    }
  };
  
  // Handle ending the game
  const handleEndGame = async () => {
    try {
      const response = await fetch(`/api/lobbies/${params.id}/end`, {
        method: "POST"
      });
      
      if (response.ok) {
        setGameState("conclusion");
      } else {
        console.error("Failed to end game:", await response.text());
      }
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };
  
  // Handle returning to dashboard
  const handleReturnToDashboard = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-4">Quiz not found</h1>
          <Button onClick={handleReturnToDashboard}>Return to Dashboard</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 container py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            {currentQuestionIndex >= 0 && (
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            )}
          </div>
          {gameState === "question" && (
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {gameState === "waiting" && currentQuestionIndex === -1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Game Ready to Start</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    You are about to start the quiz "{quiz.title}" with {participants.length} participants.
                    There are {quiz.questions.length} questions in total.
                  </p>
                  <div className="flex justify-end">
                    <Button onClick={handleStartQuestion}>
                      Start First Question
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState === "waiting" && currentQuestionIndex >= 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready for Next Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    Question {currentQuestionIndex + 1} completed. Ready to proceed to question {currentQuestionIndex + 2}.
                  </p>
                  <div className="flex justify-end">
                    <Button onClick={handleStartQuestion}>
                      {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <>
                          Start Next Question
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "End Quiz"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState === "question" && currentQuestionIndex >= 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">Time remaining</div>
                      <div className="text-sm font-medium">{timeLeft}s</div>
                    </div>
                    <Progress value={(timeLeft / (quiz.questions[currentQuestionIndex].timeToAnswer || 30)) * 100} />
                  </div>

                  <h2 className="text-xl font-bold mb-6">{quiz.questions[currentQuestionIndex].questionText}</h2>

                  <div className="space-y-4">
                    {quiz.questions[currentQuestionIndex].answers.map((answer: any) => (
                      <div 
                        key={answer.id} 
                        className={`p-3 border rounded-md flex justify-between items-center ${
                          answer.isCorrect ? "border-green-300 dark:border-green-700" : ""
                        }`}
                      >
                        <div>{answer.answerText}</div>
                        {answer.isCorrect && (
                          <div className="text-sm text-green-600 dark:text-green-400">Correct answer</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Waiting for participants to answer...
                    </div>
                    <Button variant="outline" onClick={handleQuestionTimeout}>
                      End Question Early
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState === "results" && currentQuestionIndex >= 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Question Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-bold mb-6">{quiz.questions[currentQuestionIndex].questionText}</h2>

                  <div className="space-y-4 mb-6">
                    {quiz.questions[currentQuestionIndex].answers.map((answer: any) => {
                      // Count number of participants who chose this answer
                      const answerCount = participantAnswers.filter(
                        pa => pa.answerId === answer.id
                      ).length;
                      
                      return (
                        <div
                          key={answer.id}
                          className={`p-3 border rounded-md flex justify-between items-center ${
                            answer.isCorrect
                              ? "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700"
                              : ""
                          }`}
                        >
                          <div>{answer.answerText}</div>
                          <div className="text-sm">
                            {answerCount} {answerCount === 1 ? "participant" : "participants"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleStartQuestion}>
                      {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <>
                          Next Question
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "End Quiz"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState === "conclusion" && (
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Conclusion</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-bold mb-6">Final Results</h2>

                  <div className="space-y-2 mb-8">
                    {participants
                      .sort((a, b) => b.score - a.score)
                      .map((participant, index) => (
                        <div
                          key={participant.id}
                          className={`p-3 border rounded-md flex justify-between items-center ${
                            index === 0
                              ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700"
                              : ""
                          }`}
                        >
                          <div className="font-medium">
                            {index + 1}. {participant.username}
                            {index === 0 && " 🏆"}
                          </div>
                          <div>{participant.score} points</div>
                        </div>
                      ))}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleReturnToDashboard}>Return to Dashboard</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Tabs defaultValue="leaderboard">
              <TabsList className="w-full">
                <TabsTrigger value="leaderboard" className="flex-1">
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="participants" className="flex-1">
                  Participants
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {participants.length > 0 ? (
                      <div className="space-y-2">
                        {participants
                          .sort((a, b) => b.score - a.score)
                          .map((participant, index) => (
                            <div key={participant.id} className="p-3 border rounded-md flex justify-between items-center">
                              <div>
                                {index + 1}. {participant.username}
                              </div>
                              <div>{participant.score}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No participants yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="participants">
                <Card>
                  <CardHeader>
                    <CardTitle>Participants ({participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {participants.length > 0 ? (
                      <div className="space-y-2">
                        {participants.map((participant) => (
                          <div key={participant.id} className="p-3 border rounded-md flex justify-between items-center">
                            <div>{participant.username}</div>
                            <div className="text-sm text-muted-foreground">{participant.score} points</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No participants have joined yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
