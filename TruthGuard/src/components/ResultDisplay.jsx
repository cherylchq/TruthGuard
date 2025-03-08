import React from 'react';

function ResultDisplay({ result }) {
  const confidencePercentage = Math.round(result.confidence * 100);
  
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const confidenceColor = getConfidenceColor(result.confidence);

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-2xl font-bold mb-4">
        {result.isAIAnalysis ? 'AI Analysis Results' : 'Fact-Check Results'}
      </h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-2">Claim Analyzed:</h3>
        <p className="text-gray-800 italic">{result.claim}</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-3">
            {result.isAIAnalysis ? 'AI Analysis:' : 'Verification:'}
          </h3>
          <p className="text-gray-800">
            {result.isAIAnalysis ? result.analysis : result.factCheck}
          </p>
        </div>
        
        <div className="md:w-48 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium mb-2">Confidence Score:</h3>
          <div className="relative h-36 w-36">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-current text-gray-200"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                className={`stroke-current ${confidenceColor}`}
                strokeDasharray={`${confidencePercentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="block text-2xl font-bold">{confidencePercentage}%</span>
                <span className="text-sm text-gray-500">Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Only show sources for standard fact-check results */}
      {!result.isAIAnalysis && result.sources && result.sources.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Verified Sources:</h3>
          <div className="space-y-3">
            {result.sources.map((source, index) => (
              <div key={index} className="bg-white p-3 border rounded-md flex justify-between items-center">
                <div>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {source.title}
                  </a>
                </div>
                <div 
                  className={`rounded-full py-1 px-3 text-xs text-white font-medium ${getConfidenceColor(source.credibility)}`}
                >
                  {(source.credibility * 100).toFixed(0)}% reliable
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150 ease-in-out"
          onClick={() => window.print()}
        >
          Save Results
        </button>
      </div>
    </div>
  );
}

export default ResultDisplay;