"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher-client"
import { useGameTimer } from "@/hooks/game-timer"
import { GameWaitingScreen } from "@/components/game-client/GameWaitingScreen"
import { GameQuestionScreen } from "@/components/game-client/GameQuestionScreen"
import { GameResultsScreen } from "@/components/game-client/GameResultsScreen"
import { GameConclusionScreen } from "@/components/game-client/GameConclusionScreen"

// Define types for game data
interface Answer {
  id: number;
  answerText: string;
}

interface Question {
  id: number;
  questionText: string;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "OPEN_ENDED";
  answers: Answer[];
  // timeToAnswer is handled by initialTimeToAnswer state, derived from lobby/question settings
}

interface ResultsData {
  correctAnswers?: { answerText: string }[];
  isLastQuestion: boolean;
}

interface ConclusionData {
  rank: number;
  score: number;
  totalParticipants: number;
  topPlayers: { username: string; score: number; isYou?: boolean }[];
}


export default function GamePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"waiting" | "question" | "results" | "conclusion">("waiting");
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [initialTimeToAnswer, setInitialTimeToAnswer] = useState(30);
  
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [openAnswer, setOpenAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<boolean>(false);
  
  const [results, setResults] = useState<ResultsData | null>(null);
  const [conclusion, setConclusion] = useState<ConclusionData | null>(null);
  
  const [serverStartTime, setServerStartTime] = useState<string | null>(null);
  const timeLeft = useGameTimer(serverStartTime, initialTimeToAnswer);

  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [hostMemberId, setHostMemberId] = useState<string | null>(null);
  const [hostDisconnectTimer, setHostDisconnectTimer] = useState<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const storedToken = localStorage.getItem("participant_token");
    const storedLobbyId = localStorage.getItem("lobby_id");

    if (!storedToken || storedLobbyId !== params.id) {
      router.push("/");
      return;
    }
    setToken(storedToken);

    const pusherClient = getPusherClient();
    const lobbyChannelName = CHANNELS.lobby(params.id);
    const gameChannelName = CHANNELS.game(params.id);
    
    const lobbyChannel = pusherClient.subscribe(lobbyChannelName);
    const gameChannel = pusherClient.subscribe(gameChannelName);
    
    lobbyChannel.bind('pusher:subscription_succeeded', (members: any) => {
      console.log('Participant: Subscribed to presence lobby channel. Members:', members.members);
      let foundHost = false;
      members.each((member: { id: string; info: { isHost?: boolean } }) => {
        if (member.info.isHost) {
          console.log('Participant: Host found on subscription:', member.id);
          setHostMemberId(member.id);
          setHostDisconnected(false);
          if (hostDisconnectTimer) clearTimeout(hostDisconnectTimer);
          foundHost = true;
        }
      });
      if (!foundHost) {
        console.warn('Participant: Host not found in presence channel on initial subscription.');
        // Consider if game should proceed or wait for host. For now, we assume host might connect.
        // If a host was previously detected and is now gone, this path might also be hit if participant resubscribes.
        if (hostMemberId) { // If we were tracking a host and they are not in the list anymore
             console.log('Participant: Previously tracked host is no longer present on subscription.');
             setHostDisconnected(true);
             // Optionally start a timer here too
        }
      }
    });
    
    lobbyChannel.bind('pusher:member_added', (member: { id: string; info: { isHost?: boolean, name: string } }) => {
      console.log('Participant: Member added to lobby:', member.id, member.info);
      if (member.info.isHost) {
        console.log('Participant: Host joined/rejoined:', member.id);
        setHostMemberId(member.id);
        setHostDisconnected(false);
        if (hostDisconnectTimer) {
          clearTimeout(hostDisconnectTimer);
          setHostDisconnectTimer(null);
        }
      }
    });
    
    lobbyChannel.bind('pusher:member_removed', (member: { id: string; info: { isHost?: boolean, name: string } }) => {
      console.log('Participant: Member removed from lobby:', member.id, member.info);
      if (member.id === hostMemberId) {
        console.log('Participant: Tracked host disconnected:', member.id);
        setHostDisconnected(true);
        // Optional: Start a timer to automatically leave or show a permanent message
        const timer = setTimeout(() => {
          console.log("Participant: Host disconnection timeout reached. Consider redirecting or showing permanent message.");
          // Example: router.push("/?error=host_disconnected");
        }, 60000); // 60 seconds timeout
        setHostDisconnectTimer(timer);
      }
    });

    gameChannel.bind(EVENTS.GAME_STARTED, (data: any) => {
      // Quiz data not directly used by client beyond knowing game started
      // Client waits for QUESTION_STARTED
      if (!data.hostView) { // Ensure this event is not for host
        setGameState("waiting");
      }
    });
    
    gameChannel.bind(EVENTS.QUESTION_STARTED, (data: { question: Question; questionIndex: number; timeToAnswer: number; serverStartTime: string }) => {
      setCurrentQuestion(data.question);
      // setCurrentQuestionIndex(data.questionIndex);
      setInitialTimeToAnswer(data.timeToAnswer || 30);
      setSelectedAnswers([]);
      setOpenAnswer("");
      setSubmittedAnswer(false);
      setServerStartTime(data.serverStartTime);
      setGameState("question");
    });
    
    gameChannel.bind(EVENTS.QUESTION_ENDED, (data: { correctAnswers: { answerText: string }[]; isLastQuestion: boolean }) => {
      setResults({
        correctAnswers: data.correctAnswers,
        isLastQuestion: data.isLastQuestion
      });
      setGameState("results");
      
      // Transition after a delay, unless it's the last question
      // GAME_ENDED event will transition from results to conclusion for the last question
      if (!data.isLastQuestion) {
        setTimeout(() => {
          setGameState("waiting");
        }, 5000); // Show results for 5 seconds
      }
    });
    
    gameChannel.bind(EVENTS.GAME_ENDED, (data: ConclusionData) => {
      setConclusion(data);
      setGameState("conclusion");
    });
    
    return () => {
      pusherClient.unsubscribe(lobbyChannelName); // Unsubscribe from lobby channel
      pusherClient.unsubscribe(gameChannelName);
      if (hostDisconnectTimer) {
        clearTimeout(hostDisconnectTimer);
      }
      // It's good practice to unbind specific event handlers if they cause issues,
      // though Pusher's unsubscribe usually handles channel-specific binds.
      // lobbyChannel.unbind_all();
      // gameChannel.unbind_all();
    };
  }, [params.id, router, hostMemberId, hostDisconnectTimer]); // Added hostMemberId and hostDisconnectTimer

  const submitAnswerToServer = useCallback(async (answerPayload: any) => {
    if (!token || !currentQuestion) return;
    try {
      const response = await fetch(`/api/lobbies/${params.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          ...answerPayload
        })
      });
      if (!response.ok) {
        console.error("Failed to submit answer/timeout:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting answer/timeout:", error);
    }
  }, [token, params.id, currentQuestion]);

  const handleAnswerSelect = useCallback((answerId: number) => {
    if (submittedAnswer || !currentQuestion) return;
    
    if (currentQuestion.questionType === "MULTIPLE_CHOICE") {
      setSelectedAnswers((prev) =>
        prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId]
      );
    } else { // SINGLE_CHOICE, TRUE_FALSE
      setSelectedAnswers([answerId]);
    }
  }, [submittedAnswer, currentQuestion]);

  const handleSubmitAnswer = useCallback(async () => {
    if (submittedAnswer || !currentQuestion) return;
    setSubmittedAnswer(true);
    
    let answerIdPayload = null;
    // For MULTIPLE_CHOICE, API needs to handle array or you send one by one / or a specific format.
    // For this example, if multiple answers are selected, we'll send the array.
    // The backend API POST /answer currently expects a single answerId or null.
    // This part needs alignment with backend if multiple answers for MULTIPLE_CHOICE are to be stored.
    // For now, let's assume single answerId for simplicity or first selected for MC.
    if (selectedAnswers.length > 0 && (currentQuestion.questionType !== "OPEN_ENDED")) {
        answerIdPayload = currentQuestion.questionType === "MULTIPLE_CHOICE" ? selectedAnswers : selectedAnswers[0];
    }

    await submitAnswerToServer({
      answerId: answerIdPayload, // Adjust if backend supports array for MULTIPLE_CHOICE
      timeToAnswer: Math.max(0, initialTimeToAnswer - Math.floor(timeLeft)),
      openAnswer: currentQuestion.questionType === "OPEN_ENDED" ? openAnswer : undefined
    });
  }, [submittedAnswer, currentQuestion, selectedAnswers, openAnswer, initialTimeToAnswer, timeLeft, submitAnswerToServer]);

  const handleTimedOut = useCallback(async () => {
    if (submittedAnswer || !currentQuestion) return;
    setSubmittedAnswer(true); // Mark as submitted to prevent further actions
    await submitAnswerToServer({
      answerId: null,
      timeToAnswer: initialTimeToAnswer,
      timedOut: true
    });
  }, [submittedAnswer, currentQuestion, initialTimeToAnswer, submitAnswerToServer]);

  useEffect(() => {
    if (gameState === "question" && timeLeft <= 0 && !submittedAnswer) {
      handleTimedOut();
    }
  }, [timeLeft, gameState, submittedAnswer, handleTimedOut]);

  const hostDisconnectedBanner = hostDisconnected && (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 border-b border-yellow-700 text-black p-3 text-center z-50 shadow-lg">
      Host has disconnected. Waiting for reconnection...
      {/* You could add a countdown here if you refine the timer logic */}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted p-4 pt-16"> {/* Added pt-16 if banner is fixed */}
      {hostDisconnectedBanner}
      <div className="flex-1 flex items-center justify-center">
        {gameState === "waiting" && <GameWaitingScreen />}

        {gameState === "question" && currentQuestion && (
          <GameQuestionScreen
            question={currentQuestion}
            timeLeft={timeLeft}
            initialTimeToAnswer={initialTimeToAnswer}
            selectedAnswers={selectedAnswers}
            openAnswer={openAnswer}
            submittedAnswer={submittedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onOpenAnswerChange={setOpenAnswer}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}

        {gameState === "results" && results && (
          <GameResultsScreen results={results} />
        )}

        {gameState === "conclusion" && conclusion && (
          <GameConclusionScreen conclusion={conclusion} />
        )}
      </div>
    </div>
  );
}
