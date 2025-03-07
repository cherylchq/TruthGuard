import React, { useState, useCallback } from 'react';
import FactCheckForm from './components/FactCheckForm.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import Header from './components/Header.jsx';

function useFactCheck() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const performFactCheck = useCallback(async (data) => {
    // Reset previous state
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      if (!data || !data.claim) {
        throw new Error('Invalid input: No claim provided');
      }

      // Determine backend URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      // Perform fact-check request with more robust error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      try {
        const response = await fetch(`${backendUrl}/fact-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: data.claim }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Enhanced error handling for non-OK responses
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const responseData = await response.json();

        // Transform response
        const processedResult = {
          claim: data.claim,
          factCheck: responseData.fact_check_result?.claims?.[0]?.text || 'No detailed fact-check available',
          confidence: calculateConfidence(responseData),
          sources: extractSources(responseData)
        };

        setResult(processedResult);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Distinguish between different types of fetch errors
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your network connection.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Fact-check error:', err);
      
      // Provide more specific error messages
      const errorMessage = 
        err.message.includes('fetch') 
          ? 'Unable to connect to the fact-checking service. Please check the backend server.'
        : err.message.includes('timed out')
          ? 'The request timed out. Please check your network connection.'
        : 'An unexpected error occurred while fact-checking.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to calculate confidence
  const calculateConfidence = (responseData) => {
    if (responseData.error) return 0.3;
    
    const claims = responseData.fact_check_result?.claims;
    if (!claims || claims.length === 0) return 0.5;

    return claims.length > 0 ? 0.7 : 0.5;
  };

  // Helper function to extract sources
  const extractSources = (responseData) => {
    const claims = responseData.fact_check_result?.claims || [];
    
    return claims.slice(0, 3).map(claim => ({
      title: claim.claimReview?.[0]?.publisher?.name || 'Unknown Source',
      url: claim.claimReview?.[0]?.url || '#',
      credibility: 0.8
    }));
  };

  const clearError = () => setError(null);

  return {
    result,
    error,
    isLoading,
    performFactCheck,
    clearError
  };
}

function App() {
  const { 
    result, 
    error, 
    isLoading, 
    performFactCheck, 
    clearError 
  } = useFactCheck();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl flex-grow">
        <div className="bg-white shadow-md rounded-lg p-6">
          <FactCheckForm 
            onSubmit={performFactCheck} 
            isLoading={isLoading}
          />
          
          {/* Error Handling */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md flex justify-between items-center">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              <button 
                onClick={clearError}
                className="text-red-700 hover:text-red-900 focus:outline-none"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Result Display */}
          {result && <ResultDisplay result={result} />}
        </div>
      </main>
      
      <footer className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>© 2025 TruthGuard - AI Misinformation Detection Tool</p>
        <p className="text-xs mt-2">Powered by Fact-Checking Technologies</p>
      </footer>
    </div>
  );
}

export default App;
