import { useState, useEffect } from "react";

// Custom hook for game timer
export function useGameTimer(serverStartTime: string | null, durationSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  
  useEffect(() => {
    if (!serverStartTime) {
      setTimeLeft(durationSeconds);
      return;
    }
    
    // Calculate initial time left based on server start time
    const serverStart = new Date(serverStartTime).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - serverStart) / 1000);
    const initial = Math.max(0, durationSeconds - elapsed);
    
    setTimeLeft(initial);
    
    // Use requestAnimationFrame for smoother countdown
    let frameId: number;
    let lastTime = performance.now();
    
    const updateTimer = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      setTimeLeft(prev => {
        const next = Math.max(0, prev - delta);
        return next;
      });
      
      if (timeLeft > 0) {
        frameId = requestAnimationFrame(updateTimer);
      }
    };
    
    frameId = requestAnimationFrame(updateTimer);
    
    return () => cancelAnimationFrame(frameId);
  }, [serverStartTime, durationSeconds]);
  
  return timeLeft;
}