import React, { useState, useRef } from 'react';

function FactCheckForm({ onSubmit, isLoading }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedText = text.trim();
    if (!trimmedText) return;
    
    const submissionData = {
      claim: trimmedText,
      ...(image && { image })
    };

    await onSubmit(submissionData);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Submit Content to Fact-Check</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="claim" className="block text-base font-medium text-gray-700 mb-1">
            Enter text to fact-check:
          </label>
          <div className="relative">
            <textarea
              id="claim"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              rows="4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste an article, claim, or statement to verify"
              disabled={isLoading}
            ></textarea>
            
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute bottom-3 right-3 text-gray-500 hover:text-blue-500 focus:outline-none"
              title="Attach screenshot"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              id="file-upload"
              name="file-upload"
              disabled={isLoading}
            />
          </div>
          
          {image && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span>Screenshot attached: {image.name}</span>
              <button 
                type="button" 
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={removeImage}
                disabled={isLoading}
                title="Remove screenshot"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || (!text && !image)}
            className={`px-6 py-3 rounded-md shadow-sm text-white font-medium 
              ${(isLoading || (!text && !image)) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
              transition duration-150 ease-in-out`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Verify Facts'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FactCheckForm;