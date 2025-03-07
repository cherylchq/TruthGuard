import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Get API key from environment variable
GOOGLE_FACTCHECK_API_KEY = os.environ.get("GOOGLE_FACTCHECK_API_KEY", "")

# Fallback fact-check function for development
def mock_fact_check(query):
    """
    Provide a mock response when no API key is available
    """
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
    # If no API key, use mock response
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

# API Route: Google Fact Check
@app.route("/fact-check", methods=["POST"])
def fact_check():
    # Log incoming request for debugging
    print("Received fact-check request")
    
    # Get JSON data from request
    data = request.json
    query = data.get("query", "")
    
    # Validate query
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    # Perform fact-check
    try:
        fact_check_result = google_fact_check(query)
        return jsonify({"fact_check_result": fact_check_result})
    except Exception as e:
        print(f"Fact-check error: {e}")
        return jsonify({"error": str(e)}), 500

# Ensure server runs on all interfaces
if __name__ == "__main__":
    print("TruthGuard Backend Starting...")
    print(f"Listening on host: 0.0.0.0, port: 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)