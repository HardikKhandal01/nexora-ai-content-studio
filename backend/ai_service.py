from google import genai
from google.genai import types
from fastapi import HTTPException
from config import get_settings

settings = get_settings()

try:
    # Initialize the Gemini client using the key from .env
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    print(f"Failed to initialize Gemini Client: {e}")
    client = None

def generate_ai_content(prompt_text: str) -> str:
    """
    Function to interact with Gemini API and return the generated text.
    Uses prompt sanitization implicitly by restricting system instructions.
    """
    if not client:
        raise HTTPException(status_code=500, detail="AI Service is currently unavailable.")
    
    try:
        # System instructions to ensure professional, clean output
        system_instruction = (
            "You are an expert AI Content Assistant for Nexora Studio. "
            "Provide highly professional, accurate, and ready-to-use content based on the user's prompt. "
            "Format the output cleanly. Do not include introductory conversational filler."
        )

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7, # Balanced creativity and precision
            )
        )
        
        if response.text:
            return response.text
        else:
            raise ValueError("Empty response received from API")
            
    except Exception as e:
         # Log the actual error internally, but return a safe message to the client
        print(f"Gemini API Error: {str(e)}")
        raise HTTPException(
            status_code=503, 
            detail="Error generating content. Please try again later."
        )