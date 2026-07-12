# Basic OpenAI Chatbot in Python & Web Dashboard

A beginner-friendly terminal chatbot and a gorgeous Glassmorphism web application built using Python and OpenAI's API (`gpt-4o-mini`).

This project demonstrates how to connect to OpenAI's models, manage conversational state (multi-turn chat history), fetch responses client-side, and configure local settings securely.

---

## Features

- **Multi-Turn Chat**: Remembers context across inputs, allowing you to ask follow-up questions.
- **Sleek Web Interface**: An elegant SPA featuring premium glassmorphism styling, animated background glow orbs, and clean markdown parser rendering.
- **Secure Key Management**: Uses `.env` for the python CLI and local browser `localStorage` for the web dashboard.
- **OpenAI Integration**: Configured to use the cost-efficient, ultra-fast `gpt-4o-mini` model.

---

## Project Structure

- `terminal/main.py` – Terminal chatbot written in Python.
- `terminal/requirements.txt` – Lists python packages (`openai` and `python-dotenv`).
- `terminal/.env` – Terminal environment key configuration.
- `public/index.html` – Structure of the web application.
- `public/style.css` – Glassmorphism custom styling.
- `public/app.js` – Browser chat logic connecting directly to OpenAI Chat Completions.
- `vercel.json` – Vercel routing configuration.
- `README.md` – Guide explaining how to run and deploy.

---

## Running the Terminal Chatbot

### Prerequisites
- Python 3.8 or higher installed on your computer.

### Step 1: Open Terminal in Directory
Navigate to the `terminal` subdirectory:
```bash
cd terminal
```

### Step 2: Set Up Virtual Environment
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

### Step 4: Configure Your OpenAI API Key
1. Get an API Key from the [OpenAI Platform](https://platform.openai.com/api-keys).
2. Open the `.env` file inside the `terminal/` directory.
3. Replace the placeholder value with your actual API key:
   ```env
   OPENAI_API_KEY=sk-proj-...your_actual_key...
   ```

### Step 5: Execute
Run the chatbot:
```bash
python main.py
```

---

## Running and Deploying the Web Dashboard (Vercel)

The web dashboard is fully ready for zero-configuration deployment to **Vercel**:

1. Push your code repository to **GitHub**. (Ensure `.env` files are ignored so they don't leak).
2. Go to your **[Vercel Dashboard](https://vercel.com)**.
3. Click **Add New...** -> **Project** and import your GitHub repository.
4. Leave settings at default. Vercel automatically reads `vercel.json` and routes everything correctly.
5. Click **Deploy**.
6. Open your live `.vercel.app` domain and enjoy!
