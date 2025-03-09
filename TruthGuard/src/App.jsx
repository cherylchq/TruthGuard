import React, { useState } from 'react';
import Header from './components/Header';
import FactCheckForm from './components/FactCheckForm';
import ResultDisplay from './components/ResultDisplay';
import TabNavigation from './components/TabNavigation';
import DeepfakeForm from './components/DeepfakeForm';
import DeepfakeResults from './components/DeepfakeResults';
import DeepfakeGame from './components/DeepfakeGame';

function App() {
  const [activeTab, setActiveTab] = useState('factcheck');
  const [deepfakeSubTab, setDeepfakeSubTab] = useState('detector'); // 'detector' or 'game'
  const [isLoading, setIsLoading] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [deepfakeResult, setDeepfakeResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFactCheckSubmit = async (submissionData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a FormData object to handle both text and image
      const formData = new FormData();
      formData.append('claim', submissionData.claim);
      
      // Append image if it exists
      if (submissionData.image) {
        formData.append('image', submissionData.image);
      }
      
      // Send data to the correct endpoint
      const endpoint = submissionData.image ? '/api/analyze-content' : '/api/analyze-text';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process analysis results
      setFactCheckResult({
        claim: submissionData.claim,
        analysis: data.ai_analysis.analysis,
        confidence: data.ai_analysis.confidence,
        imageAnalyzed: !!submissionData.image
      });
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError('Failed to analyze claim. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepfakeSubmit = async (submissionData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a FormData object for the image
      const formData = new FormData();
      formData.append('image', submissionData.image);
      
      const response = await fetch('/api/analyze-deepfake', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process deepfake analysis results
      setDeepfakeResult({
        imageUrl: URL.createObjectURL(submissionData.image),
        probability: data.deepfake_analysis.probability,
        scores: data.deepfake_analysis.scores,
        summary: data.deepfake_analysis.summary
      });
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset results when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    // Only reset the result of the tab we're switching away from
    if (tab === 'factcheck') {
      setDeepfakeResult(null);
    } else {
      setFactCheckResult(null);
    }
  };

  // Handle sub-tab changes in the deepfake section
  const handleDeepfakeSubTabChange = (subTab) => {
    setDeepfakeSubTab(subTab);
    // Reset results when switching sub-tabs
    setDeepfakeResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Card-like appearance for main content */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} />
            
            {activeTab === 'factcheck' ? (
              <>
                {/* Quick Guide for Fact Check */}
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h2 className="text-lg font-semibold text-blue-800 mb-2">How TruthGuard Fact Checker Works</h2>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Enter text or a claim you want to verify</li>
                    <li>Optionally attach a screenshot of the content</li>
                    <li>Click "Verify Facts" to analyze</li>
                    <li>Review our detailed assessment with confidence rating</li>
                  </ol>
                </div>
                
                {/* Fact Check Form */}
                <FactCheckForm onSubmit={handleFactCheckSubmit} isLoading={isLoading} />
                
                {/* Error Message */}
                {error && activeTab === 'factcheck' && (
                  <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                
                {/* Fact Check Results */}
                {factCheckResult && <ResultDisplay result={factCheckResult} />}
              </>
            ) : (
              <>
                {/* Deepfake Sub-tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => handleDeepfakeSubTabChange('detector')}
                    className={`py-2 px-4 font-medium text-sm mr-4 ${
                      deepfakeSubTab === 'detector'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Deepfake Detector
                  </button>
                  <button
                    onClick={() => handleDeepfakeSubTabChange('game')}
                    className={`py-2 px-4 font-medium text-sm ${
                      deepfakeSubTab === 'game'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Test Your Skills
                  </button>
                </div>
                
                {deepfakeSubTab === 'detector' ? (
                  <>
                    {/* Deepfake Detection Form */}
                    <DeepfakeForm onSubmit={handleDeepfakeSubmit} isLoading={isLoading} />
                    
                    {/* Error Message */}
                    {error && deepfakeSubTab === 'detector' && (
                      <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                        <p className="font-medium">{error}</p>
                      </div>
                    )}
                    
                    {/* Deepfake Results */}
                    {deepfakeResult && <DeepfakeResults result={deepfakeResult} />}
                  </>
                ) : (
                  /* Deepfake Game */
                  <DeepfakeGame />
                )}
              </>
            )}
          </div>
          
          {/* Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <InfoCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Advanced AI Analysis"
              description="We use cutting-edge AI to analyze claims and detect manipulated images."
            />
            <InfoCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Stay Informed"
              description="Get clear, accurate information to help fight misinformation online."
            />
            <InfoCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              }
              title="Comprehensive Tools"
              description="Fact-check claims and detect deepfakes with our dual verification system."
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} TruthGuard - Empowering you with factual information</p>
        </div>
      </footer>
    </div>
  );
}

// Helper component for info cards
function InfoCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center">
      <div className="mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default App;
