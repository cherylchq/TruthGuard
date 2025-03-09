import React from 'react';

function EnhancedHeader() {
  return (
    <header className="bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 text-white py-6 shadow-lg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-10 right-20 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-3xl flex items-center relative z-10">
        <div className="mr-4">
          <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            TruthGuard
            <span className="ml-2 bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full uppercase tracking-wider border border-white border-opacity-30">Beta</span>
          </h1>
          <p className="text-lg mt-1 text-blue-100">Verify • Empower • Share Facts</p>
        </div>
      </div>
    </header>
  );
}

export default EnhancedHeader;