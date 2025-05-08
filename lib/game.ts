//helper classes for the game


// Helper function to calculate points (can be moved to a game-logic file later)
export const calculatePoints = (
  isCorrect: boolean,
  timeTaken: number,
  questionTimeLimit: number
): number => {
  if (!isCorrect) {
    return 0;
  }
  const basePoints = 500;
  const maxTimeBonus = 500;
  // Ensure timeTaken does not exceed questionTimeLimit for calculation
  const effectiveTimeTaken = Math.min(timeTaken, questionTimeLimit);
  
  // Calculate bonus based on how quickly the answer was submitted
  // Ensure questionTimeLimit is not zero to avoid division by zero
  const timeBonus = questionTimeLimit > 0 
    ? Math.max(0, (1 - effectiveTimeTaken / questionTimeLimit)) * maxTimeBonus
    : 0;
    
  return Math.round(basePoints + timeBonus);
};
