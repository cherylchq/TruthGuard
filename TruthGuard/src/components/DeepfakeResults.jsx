import React from 'react';

function DeepfakeResults({ result }) {
  // Safely access probability with fallback to 0
  const probability = result && typeof result.probability === 'number' ? result.probability : 0;
  
  // Convert the probability to percentage for display
  const probabilityPercentage = Math.round(probability * 100);
  
  // Determine verdict based on probability
  const getVerdict = (probability) => {
    if (probability >= 0.85) return { text: 'LIKELY DEEPFAKE', color: 'bg-red-500', textColor: 'text-red-700' };
    if (probability >= 0.60) return { text: 'POSSIBLY MANIPULATED', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (probability >= 0.30) return { text: 'SUSPICIOUS', color: 'bg-yellow-400', textColor: 'text-yellow-800' };
    return { text: 'LIKELY AUTHENTIC', color: 'bg-green-500', textColor: 'text-green-700' };
  };
  
  const verdict = getVerdict(probability);

  // Safely format the scores for display
  const formatScores = () => {
    // Check if scores exist and have the expected structure
    if (!result || !result.scores || typeof result.scores !== 'object') {
      return [];
    }
    
    // Map through the scores and format them
    return Object.entries(result.scores).map(([key, value]) => {
      // Ensure the value is a number
      const scoreValue = typeof value === 'number' ? value : 0;
      
      // Transform snake_case to Title Case
      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Format the value as a percentage
      const formattedValue = Math.round(scoreValue * 100);
      
      return {
        name: formattedKey,
        value: formattedValue,
        color: getScoreColor(formattedValue)
      };
    });
  };
  
  // Get color based on score value
  const getScoreColor = (value) => {
    if (value >= 60) return 'text-red-600';
    if (value >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const formattedScores = formatScores();

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-2xl font-bold mb-4">Deepfake Analysis Results</h2>
      
      {/* Verdict Banner */}
      <div className={`flex items-center justify-between p-4 mb-6 rounded-lg ${verdict.color} bg-opacity-20 border-l-4 ${verdict.color}`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${verdict.color} mr-3`}>
            {verdict.text === 'LIKELY AUTHENTIC' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : verdict.text === 'LIKELY DEEPFAKE' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${verdict.textColor}`}>{verdict.text}</h3>
            <p className="text-gray-700">Deepfake probability: {probabilityPercentage}%</p>
          </div>
        </div>
        
        <div className="hidden md:block">
          {/* Probability Meter */}
          <div className="relative h-20 w-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                className="stroke-current text-gray-200"
                cx="18" cy="18" r="16"
                fill="none"
                strokeWidth="3"
              />
              <circle
                className={`stroke-current ${verdict.color}`}
                cx="18" cy="18" r="16"
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${probabilityPercentage}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{probabilityPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Preview */}
      {result.imageUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Analyzed Image:</h3>
          <div className="bg-gray-100 p-2 rounded-lg">
            <img 
              src={result.imageUrl} 
              alt="Analyzed" 
              className="max-h-64 max-w-full mx-auto rounded"
            />
          </div>
        </div>
      )}
      
      {/* Manipulation Indicators */}
      {formattedScores.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Detection Scores:</h3>
          <div className="grid grid-cols-1 gap-3">
            {formattedScores.map((score, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{score.name}</span>
                  <span className={`font-bold ${score.color}`}>{score.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${score.value >= 60 ? 'bg-red-500' : score.value >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${score.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Detailed Analysis */}
      {result.summary && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Analysis Summary:</h3>
          <p className="text-gray-800">{result.summary}</p>
        </div>
      )}
      
      {/* Understanding Results */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Understanding the Results</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li><span className="font-bold">Likely Authentic (0-29%)</span>: Image shows low probability of manipulation</li>
          <li><span className="font-bold">Suspicious (30-59%)</span>: Some indicators of potential manipulation</li>
          <li><span className="font-bold">Possibly Manipulated (60-84%)</span>: Moderate evidence of manipulation</li>
          <li><span className="font-bold">Likely Deepfake (85-100%)</span>: Strong indicators of digital manipulation</li>
        </ul>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out flex items-center"
          onClick={() => window.print()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Save Results
        </button>
        <button 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150 ease-in-out flex items-center"
          onClick={() => window.location.reload()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Analyze Another Image
        </button>
      </div>
    </div>
  );
}

export default DeepfakeResults;
