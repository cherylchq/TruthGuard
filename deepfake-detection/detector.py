import requests
from config import API_USER, API_SECRET

class DeepfakeDetector:
    def __init__(self, threshold=0.5):
        self.api_user = API_USER
        self.api_secret = API_SECRET
        self.api_url = "https://api.sightengine.com/1.0/check.json"
        self.threshold = threshold
    
    def detect_from_url(self, image_url):
        """Detect if an image from a URL is a deepfake"""
        params = {
            'models': 'deepfake,genai',
            'api_user': self.api_user,
            'api_secret': self.api_secret,
            'url': image_url
        }
        
        response = requests.get(self.api_url, params=params)
        #print("Response from URL detection:", response.json()) #debugging
        return self._process_response(response)
    
    def detect_from_file(self, file_path):
        """Detect if an image file is a deepfake"""
        params = {
            'models': 'deepfake,genai',
            'api_user': self.api_user,
            'api_secret': self.api_secret,
        }
        
        with open(file_path, 'rb') as image_file:
            response = requests.post(self.api_url, files={'media': image_file}, params=params)

        #print("Response from file detection:", response.json()) #debugging
        
        return self._process_response(response)
    
    def _process_response(self, response):
        """Process the API response and determine if an image is a deepfake or AI-generated."""
        data = response.json()

        if 'type' not in data:
            return {"error": "Invalid response from API"}

        deepfake_prob = data['type'].get('deepfake', 0.0)
        ai_generated_prob = data['type'].get('ai_generated', 0.0)

        # Take the maximum probability between the two models
        max_prob = max(deepfake_prob, ai_generated_prob)

        # If max probability exceeds threshold, classify as deepfake
        is_deepfake = max_prob >= self.threshold

        return {
            'is_deepfake': is_deepfake,
            'deepfake_probability': max_prob,  # Reflect the highest probability
            'confidence_level': "Likely deepfake" if is_deepfake else "Likely genuine",
            'raw_result': data
        }
