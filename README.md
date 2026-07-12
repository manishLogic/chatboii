# Basic Gemini Chatbot in Python

A beginner-friendly terminal-based chatbot application built using Python and the official unified **Google Gen AI SDK** (Gemini API). 

This project demonstrates how to connect to Google's Gemini models, maintain conversational context (multi-turn chat history), load configurations from environment files (`.env`), and handle network/API errors gracefully.

---

## Features

- **Multi-Turn Conversation**: Gemini remembers context and references previous parts of your conversation.
- **Unified SDK**: Uses the latest, official `google-genai` Python library.
- **Secure Configuration**: The API key is stored in a separate `.env` file instead of being hardcoded in the source code.
- **Robust Error Handling**: Handles missing API keys, network/internet drops, and incorrect credentials cleanly without crashing.
- **Interactive UI**: Simple, clean terminal formatting.

---

## Project Structure

- `main.py` – Core program containing the main interaction loop, initialization, and error handling.
- `.env` – Local configuration file for storing your sensitive Google Gemini API Key.
- `requirements.txt` – Package dependencies file.
- `README.md` – Installation, setup, and usage documentation.

---

## Setup & Installation

### Prerequisites
- Python 3.8 or higher installed on your computer.

### Step 1: Clone or Copy the Repository
Place all the project files into a folder on your computer.

### Step 2: Create and Activate a Virtual Environment (Recommended)
It is best practice to install dependencies inside a virtual environment to keep your global Python installation clean.

First, navigate to the `terminal` directory:
```bash
cd terminal
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Dependencies
Install the required libraries listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Step 4: Configure Your Gemini API Key
1. Get a free API Key from Google AI Studio at **[https://aistudio.google.com/](https://aistudio.google.com/)**.
2. Open the `.env` file in the `terminal/` directory.
3. Replace the placeholder value `your_gemini_api_key_here` with your actual API key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key...
   ```

---

## Running the Chatbot

Start the chatbot by executing:
```bash
python main.py
```

### Example Interaction

```text
Initializing chatbot client...

============================================================
       Welcome to the Gemini Python Chatbot!       
============================================================
Instructions:
- Type your question and press Enter to chat.
- Type 'exit' or 'quit' to end the conversation.
============================================================

You: Hello! My name is Alice.
Gemini: Hello Alice! Nice to meet you. How can I help you today?

You: What is my name?
Gemini: Your name is Alice!

You: exit

Goodbye! Have a nice day.
```

---

## License

This project is open-source and free to use.
