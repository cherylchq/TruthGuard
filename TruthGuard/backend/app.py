import os
import requests
import base64
import random
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Get API keys from environment variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SIGHTENGINE_API_USER = os.environ.get("SIGHTENGINE_API_USER", "")
SIGHTENGINE_API_SECRET = os.environ.get("SIGHTENGINE_API_SECRET", "")

# Function: OpenAI GPT-based Text Misinformation Checker
def ai_fact_check(text):
    if not OPENAI_API_KEY:
        print("Warning: No OpenAI API key provided. Using mock response.")
        return {
            "analysis": "Mock AI analysis: Unable to analyze without OpenAI API key.",
            "confidence": 0.5
        }
    
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You are an AI that detects misinformation. Analyze the following claim and determine if it's likely true or false. After your analysis, include a line that says 'Confidence: X' where X is a decimal between 0 and 1 representing your confidence in the assessment."},
            {"role": "user", "content": text}
        ],
        "temperature": 0.3,
        "max_tokens": 500
    }
    
    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", 
                               headers=headers, json=payload, timeout=30)
        
        print(f"OpenAI API response status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            
            # Try to extract confidence value
            confidence = 0.5  # Default
            confidence_match = re.search(r'Confidence:\s*(0\.\d+|1\.0|1)', content, re.IGNORECASE)
            if confidence_match:
                confidence = float(confidence_match.group(1))
                # Ensure confidence is between 0 and 1
                confidence = max(0, min(1, confidence))
            
            return {
                "analysis": content,
                "confidence": confidence
            }
        else:
            print(f"API Error: {response.text}")
            return {
                "analysis": f"Error: API returned status code {response.status_code}",
                "confidence": 0.3
            }
    except Exception as e:
        print(f"Error during AI analysis: {e}")
        return {
            "analysis": f"Error during analysis: {str(e)}",
            "confidence": 0.3
        }

# Function: Analyze both text and image content
def ai_content_check(text, image_file=None):
    if not OPENAI_API_KEY:
        print("Warning: No OpenAI API key provided. Using mock response.")
        return {
            "analysis": "Mock AI analysis: Unable to analyze without OpenAI API key.",
            "confidence": 0.5
        }
    
    # Improved system message that properly handles image claims
    system_message = """You are an AI that verifies claims about content. 
You will be given an image and/or a text claim.

When an image is provided with a claim about that image:
1. First, describe what you see in the image.
2. Then explicitly evaluate whether the claim is TRUE, LIKELY TRUE, FALSE, or LIKELY FALSE based on what's visible in the image.
3. Important: Even if the image shows something fictional, computer-generated, or artistic, evaluate the claim based on what is depicted. For example, if the claim is "This image shows a city" and the image shows a fictional sci-fi cityscape, the claim is still TRUE because it does show a city, even if fictional or stylized.

When only text is provided:
Analyze the claim for factual accuracy based on your knowledge.

After your analysis, include a line that says 'Confidence: X' where X is a decimal between 0 and 1 representing your confidence in the assessment.
"""
    
    # Prepare the headers and messages
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    
    # Prepare the messages array with system message
    messages = [
        {"role": "system", "content": system_message}
    ]
    
    # Handle the content based on what was provided
    if image_file:
        # If image is provided, we need to encode it to base64
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        image_file.seek(0)  # Reset file pointer for potential reuse
        
        # Create a multimodal message with both text and image
        content = []
        
        # Add text part if provided
        if text:
            content.append({
                "type": "text", 
                "text": f"Claim: {text}\n\nPlease analyze whether this claim about the image is true or false."
            })
        
        # Add image part
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_data}"
            }
        })
        
        messages.append({
            "role": "user",
            "content": content
        })
    else:
        # Text-only message
        messages.append({
            "role": "user", 
            "content": f"Claim: {text}\n\nPlease analyze whether this claim is true or false."
        })
    
    # Create the API payload
    payload = {
        "model": "gpt-4o",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 500
    }
    
    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", 
                               headers=headers, json=payload, timeout=30)
        
        print(f"OpenAI API response status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            
            # Try to extract confidence value
            confidence = 0.5  # Default
            confidence_match = re.search(r'Confidence:\s*(0\.\d+|1\.0|1)', content, re.IGNORECASE)
            if confidence_match:
                confidence = float(confidence_match.group(1))
                # Ensure confidence is between 0 and 1
                confidence = max(0, min(1, confidence))
            
            return {
                "analysis": content,
                "confidence": confidence
            }
        else:
            print(f"API Error: {response.text}")
            return {
                "analysis": f"Error: API returned status code {response.status_code}",
                "confidence": 0.3
            }
    except Exception as e:
        print(f"Error during content analysis: {e}")
        return {
            "analysis": f"Error during analysis: {str(e)}",
            "confidence": 0.3
        }

# Function: Analyze image for deepfake indicators using Sightengine API
def analyze_deepfake(image_file):
    if not SIGHTENGINE_API_USER or not SIGHTENGINE_API_SECRET:
        print("Warning: No Sightengine API credentials provided. Using mock response.")
        return {
            "probability": 0.65,
            "scores": {
                "deepfake": 0.65
            },
            "summary": "Mock deepfake analysis: Unable to analyze without Sightengine API credentials."
        }
    
    try:
        # Prepare the request to Sightengine API
        url = 'https://api.sightengine.com/1.0/check.json'
        
        # Parameters for the API call - using the correct 'deepfake' model
        params = {
            'models': 'deepfake',
            'api_user': SIGHTENGINE_API_USER,
            'api_secret': SIGHTENGINE_API_SECRET
        }
        
        # Print debugging info
        print(f"Sending request to Sightengine with user: {SIGHTENGINE_API_USER}")
        
        # Make sure we start from the beginning of the file
        image_file.seek(0)
        
        # Submit the image to the API
        files = {'media': image_file}
        response = requests.post(url, files=files, data=params)
        
        # Process the response
        print(f"Sightengine API response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Sightengine API response: {result}")
            
            # Extract deepfake probability from Sightengine response
            # The structure is: {'type': {'deepfake': score}}
            deepfake_score = result.get('type', {}).get('deepfake', 0)
            
            # Scores dictionary
            scores = {
                "deepfake": deepfake_score
            }
            
            # Generate a human-readable summary
            summary = generate_deepfake_summary(deepfake_score)
            
            return {
                "probability": deepfake_score,
                "scores": scores,
                "summary": summary
            }
        else:
            error_msg = f"Sightengine API Error: {response.status_code}"
            try:
                error_data = response.json()
                error_msg += f" - {error_data.get('error', {}).get('message', '')}"
            except:
                pass
            
            print(error_msg)
            return {
                "probability": 0.3,
                "scores": {"deepfake": 0.3},
                "summary": f"Error: {error_msg}"
            }
    except Exception as e:
        print(f"Error during deepfake analysis: {e}")
        return {
            "probability": 0.3,
            "scores": {"deepfake": 0.3},
            "summary": f"Error during analysis: {str(e)}"
        }

# Generate a summary based on deepfake analysis
def generate_deepfake_summary(probability):
    # Convert to percentage for easier interpretation
    score_percentage = probability * 100
    
    if probability < 0.3:
        base_message = "This image appears to be authentic with no significant signs of manipulation."
    elif probability < 0.6:
        base_message = "This image shows some potential signs of manipulation, but evidence is not conclusive."
    else:
        base_message = "This image shows strong indicators of being a deepfake or manipulated content."
    
    # Add specific details based on the score
    if probability < 0.01:
        details = "Our AI analysis detected almost no indicators of manipulation in this image."
    elif probability < 0.3:
        details = f"The deepfake detection score of {score_percentage:.1f}% is relatively low, suggesting this is likely a genuine image."
    elif probability < 0.6:
        details = f"The deepfake detection score of {score_percentage:.1f}% indicates some suspicious patterns that could suggest manipulation."
    else:
        details = f"The high deepfake detection score of {score_percentage:.1f}% strongly suggests this image has been artificially generated or manipulated."
    
    # Add a reminder about limitations
    limitation = "Remember that deepfake detection technology is continually evolving and no detection system is 100% accurate."
    
    # Combine all parts
    summary = f"{base_message} {details} {limitation}"
    
    return summary

# API Route: Text-only Analysis
@app.route("/analyze-text", methods=["POST"])
def analyze_text():
    print("Received text-only analysis request")
    
    # Get the claim text from form data
    claim = request.form.get("claim", "")
    
    if not claim:
        return jsonify({"error": "No claim provided"}), 400
    
    try:
        ai_analysis = ai_fact_check(claim)
        return jsonify({"ai_analysis": ai_analysis})
    except Exception as e:
        print(f"AI text analysis error: {e}")
        return jsonify({"error": str(e)}), 500

# API Route: Content Analysis (Text + Image)
@app.route("/analyze-content", methods=["POST"])
def analyze_content():
    print("Received content analysis request (text + image)")
    
    # Get text and image from form data
    claim = request.form.get("claim", "")
    image_file = request.files.get("image")
    
    if not claim and not image_file:
        return jsonify({"error": "No content provided"}), 400
    
    try:
        ai_analysis = ai_content_check(claim, image_file)
        return jsonify({"ai_analysis": ai_analysis})
    except Exception as e:
        print(f"AI content analysis error: {e}")
        return jsonify({"error": str(e)}), 500

# API Route: Deepfake Analysis
@app.route("/analyze-deepfake", methods=["POST"])
def analyze_deepfake_route():
    print("Received deepfake analysis request")
    
    # Get image from form data
    image_file = request.files.get("image")
    
    if not image_file:
        return jsonify({"error": "No image provided"}), 400
    
    try:
        # Add debug info
        print(f"Image filename: {image_file.filename}")
        
        deepfake_analysis = analyze_deepfake(image_file)
        return jsonify({"deepfake_analysis": deepfake_analysis})
    except Exception as e:
        error_message = str(e)
        print(f"Deepfake analysis error: {error_message}")
        return jsonify({"error": f"Analysis failed: {error_message}"}), 500
    
# Function to get a random image from a specified dataset folder
def get_random_image_path(category):
    base_path = os.path.join(os.path.dirname(__file__), 'Dataset')
    print(f"Base path: {base_path}")
    
    if category not in ['Fake', 'Real', 'random']:
        return None, "Invalid category"
        
    if category == 'random':
        # Randomly choose Fake or Real folder
        category = random.choice(['Fake', 'Real'])
    
    folder_path = os.path.join(base_path, category)
    print(f"Looking in folder: {folder_path}")
    
    if not os.path.exists(folder_path):
        print(f"Path not found: {folder_path}")
        return None, f"Path not found: {folder_path}"
    
    try:
        # Get list of image files (supporting common image formats)
        image_files = [f for f in os.listdir(folder_path) 
                      if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
        
        print(f"Found {len(image_files)} images in {folder_path}")
        
        if not image_files:
            return None, f"No image files in {folder_path}"
            
        # Select a random image
        random_image = random.choice(image_files)
        image_path = os.path.join(folder_path, random_image)
        
        print(f"Selected image: {image_path}")
        return image_path, category
    except Exception as e:
        print(f"Error accessing images: {str(e)}")
        return None, f"Error accessing images: {str(e)}"

# Route to get random image for the game
@app.route("/game/random-image", methods=["GET"])
def get_game_image():
    try:
        print("Received request for random image")
        # Get a random image (either fake or real)
        image_path, category = get_random_image_path('random')
        
        if not image_path:
            print(f"Failed to get image: {category}")
            return jsonify({"error": category}), 404
            
        # Return just the category info (real/fake) and the image filename
        image_filename = os.path.basename(image_path)
        
        response_data = {
            "category": category,
            "image_url": f"/api/game/image/{category}/{image_filename}"
        }
        print(f"Sending response: {response_data}")
        
        return jsonify(response_data)
    except Exception as e:
        print(f"Error in random image endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Route to serve the actual image file
@app.route("/game/image/<category>/<filename>", methods=["GET"])
def serve_game_image(category, filename):
    try:
        base_path = os.path.join(os.path.dirname(__file__), 'Dataset')
        image_path = os.path.join(base_path, category, filename)
        
        print(f"Attempting to serve image: {image_path}")
        
        # Validate the path to prevent directory traversal attacks
        if not os.path.normpath(image_path).startswith(os.path.normpath(base_path)):
            print(f"Invalid path detected: {image_path}")
            return jsonify({"error": "Invalid path"}), 403
            
        if not os.path.exists(image_path):
            print(f"Image not found: {image_path}")
            return jsonify({"error": "Image not found"}), 404
            
        print(f"Successfully serving image: {image_path}")
        return send_file(image_path)
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Route to validate a user's guess
@app.route("/game/check-answer/<category>/<user_guess>", methods=["GET"])
def check_game_answer(category, user_guess):
    print(f"Checking answer: category={category}, guess={user_guess}")
    # Convert strings to lowercase for comparison
    category = category.lower()
    user_guess = user_guess.lower()
    
    # Check if the user's guess matches the actual category
    is_correct = (category.lower() == user_guess)
    
    return jsonify({
        "correct": is_correct,
        "actual_category": category
    })

# Ensure server runs on all interfaces
if __name__ == "__main__":
    print("TruthGuard Backend Starting...")
    print(f"Listening on host: 0.0.0.0, port: 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)

