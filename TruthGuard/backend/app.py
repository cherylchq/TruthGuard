import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Get API keys from environment variables
GOOGLE_FACTCHECK_API_KEY = os.environ.get("GOOGLE_FACTCHECK_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# Fallback fact-check function for development
def mock_fact_check(query):
    return {
        "claims": [{
            "text": f"Mock fact-check for: {query}",
            "claimReview": [{
                "publisher": {"name": "TruthGuard Mock Service"},
                "url": "https://example.com"
            }]
        }]
    }

# Function: Google Fact Check API
def google_fact_check(query):
    if not GOOGLE_FACTCHECK_API_KEY:
        print("Warning: No Google Fact Check API key provided. Using mock response.")
        return mock_fact_check(query)
    
    url = f"https://factchecktools.googleapis.com/v1alpha1/claims:search?query={query}&key={GOOGLE_FACTCHECK_API_KEY}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API request failed with status {response.status_code}")
            return mock_fact_check(query)
    except Exception as e:
        print(f"Error fetching fact-check: {e}")
        return mock_fact_check(query)

# Function: OpenAI GPT-based Text Misinformation Checker
def ai_fact_check(text):
    if not OPENAI_API_KEY:
        print("Warning: No OpenAI API key provided. Using mock response.")
        return {
            "analysis": "Mock AI analysis: Unable to analyze without OpenAI API key.",
            "confidence": 0.3
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

# API Route: Google Fact Check
@app.route("/fact-check", methods=["POST"])
def fact_check():
    print("Received fact-check request")
    
    data = request.json
    query = data.get("query", "")
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        fact_check_result = google_fact_check(query)
        return jsonify({"fact_check_result": fact_check_result})
    except Exception as e:
        print(f"Fact-check error: {e}")
        return jsonify({"error": str(e)}), 500

# API Route: AI Analysis
@app.route("/analyze-text", methods=["POST"])
def analyze_text():
    print("Received AI analysis request")
    
    data = request.json
    query = data.get("query", "")
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        ai_analysis = ai_fact_check(query)
        return jsonify({"ai_analysis": ai_analysis})
    except Exception as e:
        print(f"AI analysis error: {e}")
        return jsonify({"error": str(e)}), 500

# Ensure server runs on all interfaces
if __name__ == "__main__":
    print("TruthGuard Backend Starting...")
    print(f"Listening on host: 0.0.0.0, port: 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)