import React, { useState, useRef } from 'react';

function DeepfakeForm({ onSubmit, isLoading }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!image) {
      setError("Please select an image to analyze");
      return;
    }
    
    try {
      await onSubmit({ image });
    } catch (err) {
      setError(`Error submitting image: ${err.message}`);
      console.error("Form submission error:", err);
    }
  };

  const handleImageChange = (e) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!acceptedTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Detect Deepfake Images</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {!imagePreview ? (
            <div className="space-y-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-gray-600">Upload an image to check for deepfake indicators</p>
              <p className="text-xs text-gray-500">Supports JPEG, PNG, and WebP formats (max 5MB)</p>
              <button
                type="button"
                onClick={triggerFileInput}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition duration-150 ease-in-out"
                disabled={isLoading}
              >
                Select Image
              </button>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-64 max-w-full mx-auto rounded"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="mt-2 text-gray-600">{image && image.name}</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={isLoading}
          />
        </div>
        
        {/* Error message display */}
        {error && (
          <div className="text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !image}
            className={`px-6 py-3 rounded-md shadow-sm text-white font-medium 
              ${(isLoading || !image) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
              transition duration-150 ease-in-out`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Detect Deepfake'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <h3 className="text-sm font-medium text-blue-800">About Deepfake Detection</h3>
        <p className="text-sm text-blue-700 mt-1">
          Our deepfake detector uses Sightengine's advanced AI to identify manipulated or synthetically 
          generated images. Note that no detection is 100% accurate, and results should be used as one 
          factor in your overall assessment.
        </p>
      </div>
    </div>
  );
}

export default DeepfakeForm;
