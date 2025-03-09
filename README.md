# TruthGuard

TruthGuard is a comprehensive misinformation detection platform that helps users identify AI-generated or manipulated content across multiple formats. This tool combines computer vision and natural language processing technologies to offer three key features: AI text misinformation detection, deepfake image analysis, and an interactive deepfake image game that educates users. Through these capabilities, TruthGuard empowers users to verify the authenticity of digital content they encounter online.

## Features

- **Image Authentication**: Upload and analyze images to detect potential AI manipulation
- **Confidence Scoring**: Receive a detailed authenticity score for uploaded media
- **Analysis Breakdown**: Get a comprehensive breakdown of detection results
- **User-Friendly Interface**: Clean, intuitive design for easy navigation
- **Secure Processing**: All media processing is done securely and privately

## Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router

### Backend

- Python
- Flask API

### External APIs

- SightEngine - For image processing and initial detection
- OpenAI API - For enhanced analysis and result interpretation

## Installation

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- pip
- API keys for SightEngine and OpenAI

### Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/cherylchq/TruthGuard.git
cd TruthGuard
```

2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Environment Configuration

   - Create a `.env` file in the backend directory with the following variables:

   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=your_secret_key
   SIGHTENGINE_API_USER=your_sightengine_api_user
   SIGHTENGINE_API_KEY=your_sightengine_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

5. Start the Backend Server

```bash
flask run
```

## Usage

1. Navigate to http://localhost:3000 in your browser
2. Choose from three main functionalities:

### AI Text Misinformation Detection

- Paste or upload text content
- Get analysis on whether the text was AI-generated
- View confidence scores and explanation of results

### Deepfake Image Detection

- Upload an image for analysis
- Receive a detailed authenticity report
- Explore breakdown of detection results with confidence scoring

### Deepfake Image Game

- Test your ability to identify AI-generated images
- Learn about common signs of deepfakes through interactive challenges
- Track your progress and improve your detection skills

## API Endpoints

### Text Analysis

- `POST /analyze-text` - Analyze text for misinformation

### Image & Text Analysis

- `POST /analyze-content` - Analyze both text and image content together

### Deepfake Detection

- `POST /analyze-deepfake` - Analyze an image for deepfake indicators

### Game Functionality

- `GET /game/random-image` - Get a random image (real or fake) for the game
- `GET /game/image/<category>/<filename>` - Serve the actual image file
- `GET /game/check-answer/<category>/<user_guess>` - Validate the user's guess

## Link to our Demo Video

https://youtu.be/BsJWZl-Xcj0

## Acknowledgments

- SightEngine for providing image analysis capabilities
- OpenAI for enhanced detection capabilities

## Contributors

- Cheryl Chin
- Daniel Wang
- Grace Ng
- Benjamin Oliver Yick
