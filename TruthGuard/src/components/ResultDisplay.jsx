import React, { useState, useEffect } from 'react';

function ResultDisplay({ result }) {
  const confidencePercentage = Math.round(result.confidence * 100);
  const [verdictInfo, setVerdictInfo] = useState({
    text: 'ANALYZING',
    color: 'bg-blue-500',
    textColor: 'text-blue-700'
  });
  
  // Extract verdict using a more sophisticated analysis
  useEffect(() => {
    // First, clean and normalize the text for analysis
    const cleanText = result.analysis.replace(/\n/g, ' ').toLowerCase();
    
    // Create a scoring system for truth indicators
    const truthScoreMap = {
      // Strong truth indicators (high positive score)
      'is true': 5,
      'is correct': 5,
      'is accurate': 5,
      'is factual': 5,
      'is valid': 4,
      'factually accurate': 5,
      'factually correct': 5,
      'evidence confirms': 5,
      'evidence supports': 4,
      'evidence verifies': 5,
      'confirmed to be true': 6,
      'has been verified': 5,
      'is supported by': 4,
      
      // Moderate truth indicators (medium positive score)
      'appears to be true': 3,
      'likely true': 3,
      'mostly true': 3,
      'generally accurate': 3,
      'largely correct': 3,
      'evidence suggests': 2,
      'evidence indicates': 2,
      'research supports': 3,
      'data confirms': 3,
      'sources confirm': 3,
      
      // False indicators (negative score)
      'is false': -5,
      'is incorrect': -5,
      'is inaccurate': -5,
      'is not true': -5,
      'not accurate': -4,
      'not correct': -4,
      'is misleading': -4,
      'evidence contradicts': -5,
      'evidence refutes': -5,
      'has been debunked': -6,
      'contradicted by': -4,
      'no evidence supports': -4,
      'lacks evidence': -3,
      
      // Moderate false indicators (medium negative score)
      'appears to be false': -3,
      'likely false': -3,
      'mostly false': -3,
      'generally inaccurate': -3,
      'largely incorrect': -3,
      'evidence doesn\'t support': -3,
      'evidence does not support': -3,
      'research contradicts': -3,
      'misrepresents': -3,
      'claims without evidence': -2,
      
      // Mixed/uncertain indicators (low score)
      'partially true': 1,
      'partially false': -1,
      'mix of': 0,
      'mixture of': 0,
      'both true and false': 0,
      'contains both': 0,
      'some aspects are true': 1,
      'some aspects are false': -1,
      'needs context': 0,
      'missing context': -1,
      'misleading without context': -2,
      'oversimplification': -1
    };
    
    // Calculate the truth score by checking for each indicator
    let truthScore = 0;
    let matches = 0;
    
    // Look for indicators and sum their scores
    Object.entries(truthScoreMap).forEach(([phrase, score]) => {
      if (cleanText.includes(phrase)) {
        truthScore += score;
        matches++;
      }
    });
    
    // Additional bias checking - examine the conclusion more heavily
    // (assuming conclusions are often at the end)
    const lastSentences = cleanText.split('.').slice(-3).join(' ');
    
    Object.entries(truthScoreMap).forEach(([phrase, score]) => {
      if (lastSentences.includes(phrase)) {
        // Give double weight to indicators in the conclusion
        truthScore += score;
        matches++;
      }
    });
    
    // Handle specific conclusion phrases
    if (lastSentences.includes('therefore true') || 
        lastSentences.includes('therefore correct') || 
        lastSentences.includes('conclude that it is true')) {
      truthScore += 6;
    }
    
    if (lastSentences.includes('therefore false') || 
        lastSentences.includes('therefore incorrect') || 
        lastSentences.includes('conclude that it is false')) {
      truthScore -= 6;
    }
    
    // Safety check - if we didn't find any matches, look for simple "true" or "false" mentions
    if (matches === 0) {
      // Count true/false mentions as a fallback
      const trueCount = (cleanText.match(/\btrue\b/g) || []).length;
      const falseCount = (cleanText.match(/\bfalse\b/g) || []).length;
      
      // Adjust score based on simple word frequency
      truthScore = trueCount > falseCount ? 2 : falseCount > trueCount ? -2 : 0;
    }
    
    // Determine verdict based on the final score
    let verdict;
    
    if (truthScore >= 5) {
      verdict = { text: 'TRUE', color: 'bg-green-500', textColor: 'text-green-700' };
    } else if (truthScore >= 2) {
      verdict = { text: 'LIKELY TRUE', color: 'bg-green-400', textColor: 'text-green-700' };
    } else if (truthScore <= -5) {
      verdict = { text: 'FALSE', color: 'bg-red-500', textColor: 'text-red-700' };
    } else if (truthScore <= -2) {
      verdict = { text: 'LIKELY FALSE', color: 'bg-red-400', textColor: 'text-red-700' };
    } else {
      verdict = { text: 'UNCERTAIN', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    }
    
    setVerdictInfo(verdict);
  }, [result.analysis]);
  
  // Function to extract relevant sentences from analysis
  const extractKeyPoints = (analysis) => {
    // Simple extraction of sentences with keywords
    const sentences = analysis.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Look for sentences with important keywords
    const evidenceSentences = sentences.filter(s => {
      const lower = s.toLowerCase();
      return lower.includes('evidence') || 
        lower.includes('source') ||
        lower.includes('study') ||
        lower.includes('research') ||
        lower.includes('data') ||
        lower.includes('according to') ||
        lower.includes('shows that') ||
        lower.includes('indicates that') ||
        lower.includes('confirms that');
    });
    
    // Look for conclusion sentences
    const conclusionSentences = sentences.filter(s => {
      const lower = s.toLowerCase();
      return lower.includes('therefore') || 
        lower.includes('thus') ||
        lower.includes('in conclusion') ||
        lower.includes('to conclude') ||
        lower.includes('overall') ||
        lower.includes('in summary');
    });
    
    // Combine results, prioritizing conclusion sentences
    let keyPoints = [...conclusionSentences];
    
    // Add evidence sentences not already included
    evidenceSentences.forEach(sentence => {
      if (!keyPoints.includes(sentence)) {
        keyPoints.push(sentence);
      }
    });
    
    // If we didn't find enough sentences, include some from the beginning and end
    if (keyPoints.length < 3 && sentences.length > 3) {
      // Add the first sentence if not already included
      if (!keyPoints.includes(sentences[0])) {
        keyPoints.unshift(sentences[0]);
      }
      
      // Add the last sentence if not already included
      const lastSentence = sentences[sentences.length - 1];
      if (!keyPoints.includes(lastSentence)) {
        keyPoints.push(lastSentence);
      }
    }
    
    // Return the key points or first few sentences if none found
    return keyPoints.length > 0 ? keyPoints : sentences.slice(0, 3);
  };

  const keyPoints = extractKeyPoints(result.analysis);

  // Classify confidence level for display
  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.5) return "Moderate";
    return "Low";
  };

  const confidenceLevel = getConfidenceLevel(result.confidence);
  const confidenceColor = result.confidence >= 0.8 ? 'text-green-600' : 
                          result.confidence >= 0.5 ? 'text-yellow-600' : 
                          'text-red-600';

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-2xl font-bold mb-4">Fact-Check Results</h2>
      
      {/* Verdict Banner */}
      <div className={`flex items-center justify-between p-4 mb-6 rounded-lg ${verdictInfo.color} bg-opacity-20 border-l-4 ${verdictInfo.color}`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${verdictInfo.color} mr-3`}>
            {verdictInfo.text === 'TRUE' || verdictInfo.text === 'LIKELY TRUE' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : verdictInfo.text === 'FALSE' || verdictInfo.text === 'LIKELY FALSE' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${verdictInfo.textColor}`}>Claim is {verdictInfo.text}</h3>
            <p className="text-gray-700">With <span className={`font-bold ${confidenceColor}`}>{confidenceLevel}</span> confidence ({confidencePercentage}%)</p>
          </div>
        </div>
        
        <div className="hidden md:block">
          {/* Confidence Meter - separate from the verdict */}
          <div className="flex items-center text-center">
            <div className="mr-2">
              <div className="text-sm text-gray-600 mb-1">Confidence</div>
              <div className={`text-lg font-bold ${confidenceColor}`}>{confidenceLevel}</div>
            </div>
            <div className="relative h-16 w-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="stroke-current text-gray-200"
                  cx="18" cy="18" r="16"
                  fill="none"
                  strokeWidth="3"
                />
                <circle
                  className={`stroke-current ${
                    result.confidence >= 0.8 ? 'text-green-500' : 
                    result.confidence >= 0.5 ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}
                  cx="18" cy="18" r="16"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${confidencePercentage}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{confidencePercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Original Claim */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {result.imageAnalyzed ? 'Content Analyzed:' : 'Claim Analyzed:'}
        </h3>
        <p className="text-gray-800 italic">{result.claim}</p>
        {result.imageAnalyzed && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>Image analyzed along with text</span>
          </div>
        )}
      </div>
      
      {/* Analysis with Key Points */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Key Findings:
        </h3>
        <div className="space-y-3">
          {keyPoints.map((point, index) => (
            <div key={index} className="flex items-start">
              <div className={`mt-1 mr-3 h-4 w-4 rounded-full flex-shrink-0 ${verdictInfo.color}`}></div>
              <p className="text-gray-800">{point.trim()}.</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Detailed Analysis (Collapsible) */}
      <details className="mb-6 border border-gray-200 rounded-lg">
        <summary className="p-4 cursor-pointer text-lg font-medium bg-gray-50 rounded-t-lg">
          View Complete Analysis
        </summary>
        <div className="p-4 border-t border-gray-200">
          <p className="text-gray-800 whitespace-pre-line">{result.analysis}</p>
        </div>
      </details>
      
      {/* How to Interpret */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Understanding the Results</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li><span className="font-bold">Verdict</span>: Our assessment of the claim based on evidence analysis</li>
          <li><span className="font-bold">Confidence</span>: How certain our AI is about its assessment</li>
          <li><span className="font-bold">Key Findings</span>: Important evidence supporting our verdict</li>
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
          Check Another Claim
        </button>
      </div>
    </div>
  );
}

export default ResultDisplay;