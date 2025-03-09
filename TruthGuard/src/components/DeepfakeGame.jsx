import React, { useState, useEffect } from 'react';

// Add these components to your DeepfakeGame.jsx

// Enhanced progress bar component
const EnhancedProgressBar = ({ currentRound, totalRounds }) => {
  const percentage = (currentRound / totalRounds) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span className="font-medium">Round {currentRound}/{totalRounds}</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Enhanced game controls
const EnhancedGameControls = ({ onGuessReal, onGuessFake, feedback, onNextRound, loading }) => {
  if (feedback) {
    return (
      <div className="flex justify-center">
        <button
          onClick={onNextRound}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Next Image
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <button
        onClick={onGuessReal}
        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Real Image
      </button>
      <button
        onClick={onGuessFake}
        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        Deepfake
      </button>
    </div>
  );
};

// Enhanced game results component
const EnhancedGameResults = ({ score, totalPlayed, gameStats, resetGame }) => {
  const scorePercentage = Math.round((score / totalPlayed) * 100);
  
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Results</h3>
        <div className="relative mx-auto w-40 h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle
              className="stroke-current text-gray-200"
              cx="18" cy="18" r="16"
              fill="none"
              strokeWidth="3"
            />
            <circle
              className={`stroke-current ${
                scorePercentage >= 80 ? 'text-green-500' : 
                scorePercentage >= 60 ? 'text-blue-500' : 
                scorePercentage >= 40 ? 'text-yellow-500' : 
                'text-red-500'
              }`}
              cx="18" cy="18" r="16"
              fill="none"
              strokeWidth="3"
              strokeDasharray={`${scorePercentage}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}/{totalPlayed}</span>
            <span className="text-lg font-medium">{scorePercentage}%</span>
          </div>
        </div>
        
        <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h4 className="font-semibold mb-3 text-gray-700">Your Detection Skills</h4>
          <div className="grid grid-cols-2 gap-y-3 text-left">
            <div className="text-gray-600">Real images identified:</div>
            <div className="font-medium">{gameStats.realIdentified}/{gameStats.realIdentified + gameStats.missedReal}</div>
            
            <div className="text-gray-600">Fake images identified:</div>
            <div className="font-medium">{gameStats.fakeIdentified}/{gameStats.fakeIdentified + gameStats.missedFake}</div>
          </div>
        </div>
        
        {scorePercentage >= 80 ? (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg font-medium">
            Excellent! You have a sharp eye for spotting deepfakes.
          </div>
        ) : scorePercentage >= 60 ? (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg font-medium">
            Good job! With practice, you'll become even better at detecting fakes.
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
            Today's deepfakes can be challenging to spot. Keep practicing to improve your skills!
          </div>
        )}
        
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

function DeepfakeGame() {
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    incorrect: 0,
    realIdentified: 0,
    fakeIdentified: 0,
    missedReal: 0,
    missedFake: 0
  });

  const fetchNewImage = async () => {
    setLoading(true);
    setFeedback(null);
    
    try {
      const response = await fetch('/api/game/random-image');
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentImage(data);
    } catch (err) {
      console.error('Error fetching game image:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to load image. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load the first image when component mounts
  useEffect(() => {
    fetchNewImage();
  }, []);

  const handleGuess = async (guess) => {
    if (!currentImage || loading) return;
    
    try {
      const response = await fetch(`/api/game/check-answer/${currentImage.category}/${guess}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update game stats
      setTotalPlayed(prev => prev + 1);
      
      const newStats = {...gameStats};
      
      if (result.correct) {
        setScore(prevScore => prevScore + 1);
        newStats.correct += 1;
        setFeedback({
          type: 'success',
          message: `Correct! This was indeed a ${currentImage.category.toLowerCase()} image.`
        });
        
        // Track which type was correctly identified
        if (currentImage.category.toLowerCase() === 'real') {
          newStats.realIdentified += 1;
        } else {
          newStats.fakeIdentified += 1;
        }
      } else {
        newStats.incorrect += 1;
        setFeedback({
          type: 'error',
          message: `Incorrect! This was actually a ${currentImage.category.toLowerCase()} image.`
        });
        
        // Track which type was missed
        if (currentImage.category.toLowerCase() === 'real') {
          newStats.missedReal += 1;
        } else {
          newStats.missedFake += 1;
        }
      }
      
      setGameStats(newStats);
      
      // Check if game over (10 rounds)
      if (totalPlayed + 1 >= 10) {
        setIsGameOver(true);
      }
      
    } catch (err) {
      console.error('Error checking answer:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to check answer. Please try again.'
      });
    }
  };

  const resetGame = () => {
    setScore(0);
    setTotalPlayed(0);
    setFeedback(null);
    setIsGameOver(false);
    setGameStats({
      correct: 0,
      incorrect: 0,
      realIdentified: 0,
      fakeIdentified: 0,
      missedReal: 0,
      missedFake: 0
    });
    fetchNewImage();
  };

  const nextRound = () => {
    fetchNewImage();
  };

  // Calculate percentage score
  const scorePercentage = totalPlayed > 0 ? Math.round((score / totalPlayed) * 100) : 0;
  
  // Get feedback color
  const getFeedbackColor = (type) => {
    switch(type) {
      case 'success': return 'bg-green-100 border-green-500 text-green-700';
      case 'error': return 'bg-red-100 border-red-500 text-red-700';
      default: return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Test Your Deepfake Detection Skills</h2>
        <div className="text-lg font-medium">
          Score: <span className="text-blue-600">{score}</span>/<span>{totalPlayed}</span>
          {totalPlayed > 0 && <span className="ml-2 text-gray-600">({scorePercentage}%)</span>}
        </div>
      </div>
      
      {/* Game instructions */}
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-6">
        <h3 className="text-sm font-medium text-blue-800 mb-1">How to Play</h3>
        <p className="text-sm text-blue-700">
          You'll be shown a series of images. Your task is to determine whether each image is real or a 
          deepfake. After 10 rounds, you'll see your final score and statistics.
        </p>
      </div>
      
      {/* Game area */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        {isGameOver ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
            <div className="text-xl mb-6">
              Final Score: <span className="text-blue-600 font-bold">{score}/10</span> ({scorePercentage}%)
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 max-w-md mx-auto">
              <h4 className="font-semibold mb-2 text-gray-700">Game Statistics</h4>
              <div className="grid grid-cols-2 gap-y-2 text-left">
                <div>Correct answers:</div>
                <div className="text-green-600 font-medium">{gameStats.correct}</div>
                
                <div>Incorrect answers:</div>
                <div className="text-red-600 font-medium">{gameStats.incorrect}</div>
                
                <div>Real images identified:</div>
                <div>{gameStats.realIdentified}/{gameStats.realIdentified + gameStats.missedReal}</div>
                
                <div>Fake images identified:</div>
                <div>{gameStats.fakeIdentified}/{gameStats.fakeIdentified + gameStats.missedFake}</div>
              </div>
            </div>
            
            <div className="mb-6">
              {scorePercentage >= 80 ? (
                <div className="text-green-600 font-medium">Excellent! You have a good eye for spotting deepfakes.</div>
              ) : scorePercentage >= 60 ? (
                <div className="text-blue-600 font-medium">Good job! With practice, you'll get even better.</div>
              ) : (
                <div className="text-orange-600 font-medium">Deepfakes can be tricky! Keep practicing to improve.</div>
              )}
            </div>
            
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            {/* Current round display */}
            <div className="text-center mb-4">
              <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                Round {totalPlayed + 1}/10
              </span>
            </div>
            
            {/* Image display area */}
            <div className="mb-6">
                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    </div>
                ) : currentImage ? (
                    <div className="text-center">
                    <img 
                        src={currentImage.image_url} 
                        alt="Guess if real or fake" 
                        className="max-h-72 mx-auto rounded-lg"
                        onError={(e) => {
                        console.error("Image failed to load:", currentImage.image_url);
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.png"; // You can add a placeholder image in your public folder
                        setFeedback({
                            type: 'error',
                            message: `Failed to load image. Please try again or check server logs.`
                        });
                        }}
                    />
                    </div>
                ) : (
                    <div className="w-full p-4 bg-red-100 text-red-700 rounded-lg text-center">
                    Failed to load image. Please try refreshing the page.
                    </div>
                )}
                </div>
            
            {/* Feedback message */}
            {feedback && (
              <div className={`p-3 mb-4 rounded-lg border-l-4 ${getFeedbackColor(feedback.type)}`}>
                <p className="font-medium">{feedback.message}</p>
              </div>
            )}
            
            {/* Game controls */}
            <div className="flex justify-center gap-4">
              {feedback ? (
                <button
                  onClick={nextRound}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
                  disabled={loading}
                >
                  Next Image
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleGuess('real')}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
                    disabled={loading || !!feedback}
                  >
                    Real
                  </button>
                  <button
                    onClick={() => handleGuess('fake')}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150 ease-in-out"
                    disabled={loading || !!feedback}
                  >
                    Fake
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DeepfakeGame;
