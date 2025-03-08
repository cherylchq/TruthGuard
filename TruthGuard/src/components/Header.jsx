import React from 'react';

function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-6 shadow-lg">
      <div className="container mx-auto px-4 max-w-3xl flex items-center">
        <div className="mr-4">
          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            TruthGuard
            <span className="ml-2 bg-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Beta</span>
          </h1>
          <p className="text-lg mt-1 text-blue-100">Verify • Empower • Share Facts</p>
        </div>
      </div>
    </header>
  );
}

export default Header;