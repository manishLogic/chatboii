import os
import sys
import openai
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def verify_api_key():
    """
    Checks if the GROQ_API_KEY environment variable is set.
    Exits the program with instructions if missing/placeholder.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    # Check if the key is missing, empty, or set to placeholder text
    if not api_key or api_key.strip() == "" or "your_groq_api_key" in api_key:
        print("=" * 60)
        print("ERROR: Groq API Key is missing or not configured!")
        print("=" * 60)
        print("Please follow these steps to set up your API Key:")
        print("1. Open the '.env' file in this directory.")
        print("2. Replace the placeholder with your actual Groq API key.")
        print("3. You can get an API key from the Groq Console:")
        print("   https://console.groq.com/")
        print("=" * 60)
        sys.exit(1)
        
    return api_key

def main():
    # 1. Verify that a valid API key exists
    verify_api_key()
    
    print("Initializing chatbot client...")
    
    try:
        # Initialize the client pointing to Groq's API Base URL.
        # It automatically detects and uses the GROQ_API_KEY environment variable for authorization.
        client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Initialize conversation history with a system message
        messages = [
            {"role": "system", "content": "You are a helpful, friendly, and intelligent AI chatbot assistant."}
        ]
        
    except Exception as e:
        print(f"\nFailed to initialize the Groq client: {e}")
        print("Please check your library installation and Python version.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("       Welcome to the Groq Python Chatbot!       ")
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
                
            print("Chatbot: Thinking...", end="\r", flush=True)
            
            # Append user message to the conversation history
            messages.append({"role": "user", "content": user_input})
            
            # Request response from Groq Chat Completions API
            # We use 'llama-3.3-70b-versatile' as the flagship powerful Llama 3 model
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages
            )
            
            # Extract response text
            bot_response = completion.choices[0].message.content
            
            # Append assistant response to history to maintain context
            messages.append({"role": "assistant", "content": bot_response})
            
            # Clear the 'Thinking...' text and print the response
            print(" " * 24, end="\r", flush=True)
            print(f"Chatbot: {bot_response}\n")
            
        except openai.AuthenticationError:
            # Clear the 'Thinking...' text
            print(" " * 24, end="\r", flush=True)
            print("-" * 60)
            print("Groq Authentication Error:")
            print("The provided API key is invalid or has expired.")
            print("Please check the GROQ_API_KEY in your .env file.")
            print("-" * 60 + "\n")
            messages.pop()
            
        except openai.RateLimitError:
            print(" " * 24, end="\r", flush=True)
            print("-" * 60)
            print("Groq Rate Limit Error:")
            print("You have exceeded your API rate limits or billing quota.")
            print("Please check your billing and quota limits on the Groq Console.")
            print("-" * 60 + "\n")
            messages.pop()
            
        except openai.APIConnectionError:
            print(" " * 24, end="\r", flush=True)
            print("-" * 60)
            print("Connection Error:")
            print("Could not connect to the Groq API servers.")
            print("Please check your internet connection and try again.")
            print("-" * 60 + "\n")
            messages.pop()
            
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
            print(" " * 24, end="\r", flush=True)
            print("-" * 60)
            print("An unexpected error occurred.")
            print(f"Details: {err}")
            print("-" * 60 + "\n")
            if messages:
                messages.pop()

if __name__ == "__main__":
    main()
