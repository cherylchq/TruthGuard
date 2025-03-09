import React, { useState, useEffect } from 'react';

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
