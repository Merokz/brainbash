"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher-client"
import { useGameTimer } from "@/hooks/game-timer";

import { LobbyDisplayCard } from "@/components/game-host/LobbyDisplayCard";
import { GameWaitingCard } from "@/components/game-host/GameWaitingCard";
import { QuestionInProgressCard } from "@/components/game-host/QuestionInProgressCard";
import { ParticipantAnswer, QuestionResultsCard } from "@/components/game-host/QuestionResultsCard";
import { GameConclusionCard } from "@/components/game-host/GameConclusionCard";
import { GameSidebar } from "@/components/game-host/GameSidebar";
import { Timer } from "lucide-react";


export default function GameHostPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [lobbyData, setLobbyData] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  // Ensure participants state matches the structure expected by child components
  // or adapt the data from Pusher events.
  // Pusher member.id is `user-${id}` or `participant-${id}`
  // Pusher member.info is { name: "username", isHost: boolean }
  const [participants, setParticipants] = useState<Array<{ id: string | number; username: string; score: number; isHost: boolean }>>([]);
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
          // Initial participants from DB can be set here, but Pusher events will soon update it
          // For simplicity, we'll let Pusher events be the primary source for the live list.
          if (data.participants) {
            setParticipants(data.participants.map((p: any) => ({ ...p, id: p.id, username: p.username, score: p.score || 0, isHost: p.userId === data.hostId })));
          }
          
          if (data.state !== "IN_LOBBY" && data.state !== "CONCLUDED") {
            setCurrentQuestionIndex(data.currentQuestionIdx ?? -1);
            if (data.state === "IN_GAME") {
              if (data.questionStartedAt && data.currentQuestionIdx !== null && data.currentQuestionIdx !== -1) {
                setGameState("question");
                setServerStartTime(data.questionStartedAt);
              } else if (data.currentQuestionIdx !== null && data.currentQuestionIdx !== -1) {
                setGameState("results");
              } else {
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
    // CHANNELS.lobby(params.id) should return 'presence-lobby-...'
    const lobbyChannelName = CHANNELS.lobby(params.id); 
    const gameChannelName = CHANNELS.game(params.id);

    const lobbyChannel = pusherClient.subscribe(lobbyChannelName);
    const gameChannel = pusherClient.subscribe(gameChannelName);

    // --- Start of Pusher Presence Event Handling ---
    lobbyChannel.bind('pusher:subscription_succeeded', (members: any) => {
      const initialParticipants: Array<{ id: string; username: string; score: number; isHost: boolean }> = [];
      members.each((member: { id: string; info: { name: string; isHost: boolean } }) => {
        initialParticipants.push({
          id: member.id, // this is the user_id from auth, e.g., "participant-123"
          username: member.info.name,
          score: 0, // Initialize score, will be updated by ANSWER_SUBMITTED
          isHost: member.info.isHost,
        });
      });
      setParticipants(initialParticipants);
    });

    lobbyChannel.bind('pusher:member_added', (member: { id: string; info: { name: string; isHost: boolean } }) => {
      setParticipants(prev => {
        if (prev.some(p => p.id === member.id)) return prev; // Already present
        return [...prev, {
          id: member.id,
          username: member.info.name,
          score: 0,
          isHost: member.info.isHost,
        }];
      });
    });

    lobbyChannel.bind('pusher:member_removed', (member: { id: string; info: { name: string; isHost: boolean } }) => {
      setParticipants(prev => prev.filter(p => p.id !== member.id));
    });
    // --- End of Pusher Presence Event Handling ---

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
        prev.map(p => {
          // Match by Pusher's member.id (e.g., "participant-101")
          // data.participantId from your backend might be the numeric ID or the string ID.
          // Ensure your EVENTS.ANSWER_SUBMITTED payload includes a consistent ID.
          // Assuming data.participantId is the string ID like "participant-123" or "user-1"
          if (p.id === data.participantId) { 
            return { ...p, score: data.newScore }; // Ensure score is updated
          }
          return p;
        })
      );
      if (data.answer) { // Ensure data.answer exists
        setParticipantAnswers(prev => [
          ...prev,
          {
            participantId: data.participantId, // Store the ID used for matching
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
  }, [params.id]);

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
        <DashboardHeader user={user} />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-4">Lobby or Quiz not found.</h1>
          <Button onClick={handleReturnToHome}>Return to Home</Button>
        </main>
      </div>
    );
  }
  
  if (!quiz && gameState !== "lobby" && gameState !== "conclusion") { // Allow conclusion if quiz becomes null post-game
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-4">Quiz data is missing for the current game state.</h1>
          <Button onClick={handleReturnToHome}>Return to Home</Button>
        </main>
      </div>
    );
  }

  const currentQuizTitle = quiz?.title || lobbyData?.quiz?.title || "Quiz";
  // Default time per question from lobby, then quiz, then 30
  const timePerQuestion = lobbyData?.timeToAnswer || quiz?.timeToAnswer || 30;


  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 container py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{currentQuizTitle}</h1>
            {gameState !== "lobby" && gameState !== "conclusion" && currentQuestionIndex >= 0 && quiz?.questions && (
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            )}
             {gameState === "lobby" && (
              <p className="text-muted-foreground">Waiting for participants to join...</p>
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
                // timePerQuestion={quiz.questions[currentQuestionIndex].timeToAnswer || timePerQuestion}
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
                participants={participants} // Ensure this matches the expected type in GameConclusionCard
                onReturnToHome={handleReturnToHome}
              />
            )}
          </div>

          <div>
            {/* Ensure GameSidebar expects participants with id: string (Pusher user_id) */}
            <GameSidebar participants={participants} gameState={gameState} />
          </div>
        </div>
      </main>
    </div>
  );
}

