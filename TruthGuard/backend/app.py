import os
import requests
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Get API key from environment variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

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
    
    # Prepare the headers and messages
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    
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
    
    # Prepare the messages array with system message
    messages = [
        {"role": "system", "content": system_message}
    ]
    
    # Handle the content based on what was provided
    if image_file:
        # If image is provided, we need to encode it to base64
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        
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

# Ensure server runs on all interfaces
if __name__ == "__main__":
    print("TruthGuard Backend Starting...")
    print(f"Listening on host: 0.0.0.0, port: 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)