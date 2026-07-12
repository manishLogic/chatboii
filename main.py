import os
import sys
from google import genai
from google.genai import errors
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def verify_api_key():
    """
    Checks if the GEMINI_API_KEY environment variable is set and valid.
    Returns the key if valid, or exits the program with instructions if missing/placeholder.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Check if the key is missing, empty, or still set to the default placeholder
    if not api_key or api_key.strip() == "" or api_key == "your_gemini_api_key_here":
        print("=" * 60)
        print("ERROR: Gemini API Key is missing or not configured!")
        print("=" * 60)
        print("Please follow these steps to set up your API Key:")
        print("1. Open the '.env' file in this directory.")
        print("2. Replace 'your_gemini_api_key_here' with your actual API key.")
        print("3. You can get a free API key from Google AI Studio:")
        print("   https://aistudio.google.com/")
        print("=" * 60)
        sys.exit(1)
        
    return api_key

def main():
    # 1. Verify that a valid API key exists
    verify_api_key()
    
    print("Initializing chatbot client...")
    
    try:
        # Initialize the official Google GenAI Client.
        # It automatically detects and uses the GEMINI_API_KEY environment variable.
        client = genai.Client()
        
        # Start a multi-turn chat session.
        # Using client.chats.create allows the model to remember conversation history.
        # We use 'gemini-2.0-flash' as it is fast, powerful, and recommended for general text.
        chat = client.chats.create(model="gemini-2.0-flash")
        
    except Exception as e:
        print(f"\nFailed to initialize the Gemini client: {e}")
        print("Please check your library installation and Python version.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("       Welcome to the Gemini Python Chatbot!       ")
    print("=" * 60)
    print("Instructions:")
    print("- Type your question and press Enter to chat.")
    print("- Type 'exit' or 'quit' to end the conversation.")
    print("=" * 60 + "\n")

    # Main interaction loop
    while True:
        try:
            # Get user input
            user_input = input("You: ").strip()
            
            # Check for exit condition
            if user_input.lower() in ["exit", "quit"]:
                print("\nGoodbye! Have a nice day.")
                break
                
            # If the user pressed enter without typing anything, prompt again
            if not user_input:
                continue
                
            print("Gemini: Thinking...", end="\r", flush=True)
            
            # Send the message to the chat session
            response = chat.send_message(user_input)
            
            # Clear the 'Thinking...' text and print the response
            print(" " * 20, end="\r", flush=True)
            print(f"Gemini: {response.text}\n")
            
        except errors.APIError as api_err:
            # Clear the 'Thinking...' text
            print(" " * 20, end="\r", flush=True)
            print("-" * 60)
            print(f"Gemini API Error (Code {api_err.code}):")
            print(f"{api_err.message}")
            if api_err.code in [400, 403]:
                print("\nTip: Please verify that your GEMINI_API_KEY in the .env file is correct.")
            print("-" * 60 + "\n")
            
        except KeyboardInterrupt:
            # Handle Ctrl+C gracefully
            print("\n\nGoodbye! Have a nice day.")
            break
            
        except EOFError:
            # Handle Ctrl+D gracefully
            print("\n\nGoodbye! Have a nice day.")
            break
            
        except Exception as err:
            # Clear the 'Thinking...' text
            print(" " * 20, end="\r", flush=True)
            print("-" * 60)
            print("An unexpected error occurred.")
            print("Please check your internet connection and try again.")
            print(f"Details: {err}")
            print("-" * 60 + "\n")

if __name__ == "__main__":
    main()
