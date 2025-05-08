"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher-client"
import { useGameTimer } from "@/hooks/game-timer";

import { LobbyDisplayCard } from "@/components/game-host/LobbyDisplayCard";
import { GameWaitingCard } from "@/components/game-host/GameWaitingCard";
import { QuestionInProgressCard } from "@/components/game-host/QuestionInProgressCard";
import { QuestionResultsCard } from "@/components/game-host/QuestionResultsCard";
import { GameConclusionCard } from "@/components/game-host/GameConclusionCard";
import { GameSidebar } from "@/components/game-host/GameSidebar";
import { Timer } from "lucide-react"; // Keep Timer if used directly in this page

// Define types for participant answers (can be moved to a shared types file)
interface ParticipantAnswer {
  participantId: number;
  questionId: number;
  answerId: number | string | null; // Ensure this matches Answer ID type
  timeToAnswer: number;
}

export default function GameHostPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [lobbyData, setLobbyData] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [gameState, setGameState] = useState<"lobby" | "waiting" | "question" | "results" | "conclusion">("lobby");
  const [loading, setLoading] = useState(true);
  const [serverStartTime, setServerStartTime] = useState<string | null>(null);
  const [participantAnswers, setParticipantAnswers] = useState<ParticipantAnswer[]>([]);
  const router = useRouter();

  const timePerQuestionForHook = gameState === "question" && quiz?.questions?.[currentQuestionIndex]?.timeToAnswer
    ? quiz.questions[currentQuestionIndex].timeToAnswer
    : (lobbyData?.timeToAnswer || 30);

  const timeLeft = useGameTimer(serverStartTime, timePerQuestionForHook);

  // Fetch initial data and set up Pusher
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        const lobbyResponse = await fetch(`/api/lobbies/${params.id}`);
        if (lobbyResponse.ok) {
          const data = await lobbyResponse.json();
          setLobbyData(data);
          if (data.quiz) {
            setQuiz(data.quiz);
          }
          if (data.participants) {
            setParticipants(data.participants);
          }
          if (data.state !== "IN_LOBBY" && data.state !== "CONCLUDED") {
            setCurrentQuestionIndex(data.currentQuestionIdx ?? -1);
            if (data.state === "IN_GAME") {
              if (data.questionStartedAt && data.currentQuestionIdx !== null && data.currentQuestionIdx !== -1) {
                setGameState("question");
                setServerStartTime(data.questionStartedAt);
              } else if (data.currentQuestionIdx !== null && data.currentQuestionIdx !== -1) {
                 // If questionStartedAt is null, but we have an index, it means results were shown
                setGameState("results");
              } else {
                // Default to waiting if game started but no question active/ended
                setGameState("waiting");
              }
            }
          } else if (data.state === "CONCLUDED") {
            setGameState("conclusion");
          } else {
            setGameState("lobby"); // Explicitly set to lobby if IN_LOBBY
          }
        } else {
          setLobbyData(null);
          setQuiz(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();

    const pusherClient = getPusherClient();
    const lobbyChannelName = CHANNELS.lobby(params.id);
    const gameChannelName = CHANNELS.game(params.id);

    const lobbyChannel = pusherClient.subscribe(lobbyChannelName);
    const gameChannel = pusherClient.subscribe(gameChannelName);

    lobbyChannel.bind(EVENTS.PARTICIPANT_JOINED, (data: any) => {
      setParticipants(prev => {
        if (prev.some(p => p.id === data.participant.id)) return prev;
        return [...prev, data.participant];
      });
    });

    lobbyChannel.bind(EVENTS.PARTICIPANT_LEFT, (data: any) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId));
    });

    // GAME_STARTED event transitions from lobby UI to game waiting UI
    lobbyChannel.bind(EVENTS.GAME_STARTED, (data: any) => {
      if (data.quiz && data.hostView) {
        setQuiz(data.quiz); // Update quiz with potentially more details for host
      }
      setLobbyData((prev: any) => ({ ...prev, state: "IN_GAME" }));
      setGameState("waiting"); // Ready to start the first question
      setCurrentQuestionIndex(-1); // Explicitly set for "Start First Question"
    });
    
    gameChannel.bind(EVENTS.ANSWER_SUBMITTED, (data: any) => {
      setParticipants(prev =>
        prev.map(p =>
          p.id === data.participantId
            ? { ...p, score: data.newScore } // Ensure score is updated
            : p
        )
      );
      if (data.answer) { // Ensure data.answer exists
        setParticipantAnswers(prev => [
          ...prev,
          {
            participantId: data.participantId,
            questionId: data.questionId,
            answerId: data.answer.answerId, // Assuming data.answer contains answerId
            timeToAnswer: data.answer.timeToAnswer, // Assuming data.answer contains timeToAnswer
          }
        ]);
      }
    });

    gameChannel.bind(EVENTS.QUESTION_STARTED, (data: any) => {
      if (data.serverStartTime) {
        setServerStartTime(data.serverStartTime);
      }
      // Ensure gameState is 'question' when a question starts
      setGameState("question");
      setCurrentQuestionIndex(data.questionIndex);
      setParticipantAnswers([]); // Clear answers for new question
    });
    
    // Add HOST_DISCONNECTED for potential cleanup or UI update
    lobbyChannel.bind(EVENTS.HOST_DISCONNECTED, () => {
        // Handle host disconnection if necessary, e.g., show a message
        console.log("Host disconnected event received");
    });


    return () => {
      pusherClient.unsubscribe(lobbyChannelName);
      pusherClient.unsubscribe(gameChannelName);
    };
  }, [params.id]); // Removed router from dependencies as it's stable

  // Monitor timeLeft for auto-transitioning to results
  useEffect(() => {
    if (gameState === "question" && timeLeft <= 0 && serverStartTime) { // only if serverStartTime is set
      handleQuestionTimeout();
    }
  }, [timeLeft, gameState, serverStartTime, currentQuestionIndex]); // Added currentQuestionIndex

  // Function to start the game from the lobby view
  const handleStartGameFromLobby = async () => {
    if (!lobbyData) return;
    try {
      const response = await fetch(`/api/lobbies/${params.id}/start`, {
        method: "POST",
      });
      if (!response.ok) {
        console.error("Failed to start game:", await response.text());
        // Potentially set an error state to show in UI
      }
      // Pusher event GAME_STARTED will handle UI transition
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleStartQuestion = async () => {
    if (!quiz || !lobbyData) return;
    
    const isEndingGame = currentQuestionIndex >= quiz.questions.length - 1;

    if (isEndingGame) { // This case should be handled by the button in QuestionResultsCard or GameWaitingCard
      handleEndGame();
      return;
    }

    const newIndex = currentQuestionIndex + 1;
    setServerStartTime(null);
    setParticipantAnswers([]);

    const question = quiz.questions[newIndex];
    // Use timeToAnswer from lobbyData as default, then quiz, then question, then 30
    const timeToAnswer = question.timeToAnswer || quiz.timeToAnswer || lobbyData.timeToAnswer || 30;


    try {
      const response = await fetch(`/api/lobbies/${params.id}/question/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIndex: newIndex, timeToAnswer }),
      });
      if (!response.ok) {
        console.error("Failed to start question:", await response.text());
      }
      // Pusher event QUESTION_STARTED will update serverStartTime, gameState, currentIndex
    } catch (error) {
      console.error("Error starting question:", error);
    }
  };

  const handleQuestionTimeout = async () => {
    // Ensure we are in 'question' state and it's the current question timing out
    if (gameState !== "question" || !lobbyData || serverStartTime === null) return;
    
    setGameState("results");
    setServerStartTime(null);

    try {
      const response = await fetch(`/api/lobbies/${params.id}/question/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIndex: currentQuestionIndex }),
      });
      if (!response.ok) {
        console.error("Failed to end question:", await response.text());
      }
    } catch (error) {
      console.error("Error ending question:", error);
    }
  };

  const handleEndGame = async () => {
    if (!lobbyData) return;
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

  const handleReturnToHome = () => {
    router.push("/");
  };

  const handleCopyJoinCode = async () => {
    const text = lobbyData?.joinCode;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert("Join code copied to clipboard!");
    } catch (err) {
      console.warn('navigator.clipboard failed', err);
      alert("Failed to copy code.");
    }
  };
  
  // This useEffect might be redundant if QUESTION_STARTED event clears answers
  // useEffect(() => {
  //   if (gameState === "question") {
  //     setParticipantAnswers([]);
  //   }
  // }, [gameState, currentQuestionIndex]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lobbyData && (gameState === "lobby" || !quiz)) {
     return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-4">lobby or quiz not found.</h1>
          <Button onClick={handleReturnToHome}>return to home</Button>
        </main>
      </div>
    );
  }
  
  if (!quiz && gameState !== "lobby" && gameState !== "conclusion") { // Allow conclusion if quiz becomes null post-game
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-4">quiz data is missing for the current game state.</h1>
          <Button onClick={handleReturnToHome}>return to home</Button>
        </main>
      </div>
    );
  }

  const currentQuizTitle = quiz?.title || lobbyData?.quiz?.title || "Quiz";
  // Default time per question from lobby, then quiz, then 30
  const timePerQuestion = lobbyData?.timeToAnswer || quiz?.timeToAnswer || 30;


  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{currentQuizTitle}</h1>
            {gameState !== "lobby" && gameState !== "conclusion" && currentQuestionIndex >= 0 && quiz?.questions && (
              <p className="text-muted-foreground">
                question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            )}
             {gameState === "lobby" && (
              <p className="text-muted-foreground">waiting for participants to join...</p>
            )}
          </div>
          {gameState === "question" && (
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span className="font-bold">{Math.ceil(timeLeft)}s</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {gameState === "lobby" && lobbyData && (
              <LobbyDisplayCard
                joinCode={lobbyData.joinCode}
                participantsCount={participants.length}
                onCopyJoinCode={handleCopyJoinCode}
                onStartGame={handleStartGameFromLobby}
              />
            )}

            {gameState === "waiting" && quiz && (
              <GameWaitingCard
                quizTitle={quiz.title}
                participantsCount={participants.length}
                questionsCount={quiz.questions.length}
                currentQuestionIndex={currentQuestionIndex}
                onStartQuestion={handleStartQuestion}
                onEndGame={handleEndGame} // Pass handleEndGame for "Show Final Results"
              />
            )}
            
            {gameState === "question" && currentQuestionIndex >= 0 && quiz?.questions?.[currentQuestionIndex] && (
              <QuestionInProgressCard
                question={quiz.questions[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                timeLeft={timeLeft}
                timePerQuestion={quiz.questions[currentQuestionIndex].timeToAnswer || timePerQuestion}
                answeredCount={participantAnswers.length}
                totalParticipants={participants.length}
                onEndQuestionEarly={handleQuestionTimeout}
              />
            )}

            {gameState === "results" && currentQuestionIndex >= 0 && quiz?.questions?.[currentQuestionIndex] && (
              <QuestionResultsCard
                question={quiz.questions[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                participantAnswers={participantAnswers}
                isLastQuestion={currentQuestionIndex >= quiz.questions.length - 1}
                onNextAction={currentQuestionIndex >= quiz.questions.length - 1 ? handleEndGame : handleStartQuestion}
              />
            )}

            {gameState === "conclusion" && (
              <GameConclusionCard
                quizTitle={currentQuizTitle}
                participants={participants}
                onReturnToHome={handleReturnToHome}
              />
            )}
          </div>

          <div>
            <GameSidebar participants={participants} gameState={gameState} />
          </div>
        </div>
      </main>
    </div>
  );
}

