import React, { useState } from 'react';
import FactCheckForm from './components/FactCheckForm.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import Header from './components/Header.jsx';

function App() {
  const [result, setResult] = useState(null);

  const handleSubmit = async (data) => {
    // TODO: Implement API call to backend
    // For now, we'll just set a mock result
    setResult({
      claim: data.text,
      factCheck: "This is a mock fact-check result. Replace with actual API response.",
      confidence: 0.85,
      sources: [
        { title: "Reliable Source 1", url: "https://example.com/reliable1", credibility: 0.9 },
        { title: "Reliable Source 2", url: "https://example.com/reliable2", credibility: 0.8 }
      ]
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white shadow-md rounded-lg p-6">
          <FactCheckForm onSubmit={handleSubmit} />
          {result && <ResultDisplay result={result} />}
        </div>
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>© 2025 TruthGuard - AI Misinformation Detection Tool</p>
      </footer>
    </div>
  );
}

export default App;