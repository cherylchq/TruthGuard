import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access credentials
API_USER = os.getenv("SIGHTENGINE_API_USER")
API_SECRET = os.getenv("SIGHTENGINE_API_SECRET")