import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// User-provided API Key from the previous configuration
const DEFAULT_API_KEY = "";

// State variables
let apiKey = localStorage.getItem("GEMINI_API_KEY") || DEFAULT_API_KEY;
let chatSession = null;
let genAI = null;
let model = null;

// DOM Elements
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const settingsBtn = document.getElementById("settings-btn");
const clearChatBtn = document.getElementById("clear-chat-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelSettingsBtn = document.getElementById("cancel-settings-btn");
const saveSettingsBtn = document.getElementById("save-settings-btn");
const apiKeyInput = document.getElementById("api-key-input");
const toggleKeyVisibility = document.getElementById("toggle-key-visibility");
const suggestedButtons = document.querySelectorAll(".suggested-btn");

// Initialize Gemini Client
function initGemini() {
    if (!apiKey || apiKey.trim() === "") {
        showSystemMessage("API key is missing. Please click the settings cog to configure your Gemini API Key.", "info");
        return false;
    }
    
    try {
        // Initialize SDK
        genAI = new GoogleGenerativeAI(apiKey);
        // Using the modern recommended gemini-2.0-flash model
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        // Start multi-turn chat session
        chatSession = model.startChat();
        return true;
    } catch (error) {
        console.error("Gemini initialization failed:", error);
        showSystemMessage("Failed to initialize Gemini API client. Please verify your API key.", "error");
        return false;
    }
}

// Show a system status banner in the chat window
function showSystemMessage(text, type = "info") {
    const msgElement = document.createElement("div");
    msgElement.className = `system-status-msg ${type}`;
    msgElement.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> <span>${text}</span>`;
    chatMessages.appendChild(msgElement);
    scrollToBottom();
}

// Scroll chat window to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Append a bubble to the chat container
function appendMessage(sender, text) {
    // Remove welcome card or any system status messages if present when a user sends their first message
    const welcomeCard = document.querySelector(".welcome-card");
    if (welcomeCard && sender === "user") {
        welcomeCard.remove();
    }

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.innerHTML = sender === "user" ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

    const wrapper = document.createElement("div");
    wrapper.className = "message-content-wrapper";

    const label = document.createElement("div");
    label.className = "message-sender";
    label.innerText = sender === "user" ? "You" : "Gemini";

    const content = document.createElement("div");
    content.className = "message-text";

    if (sender === "user") {
        // Simple plain text with HTML escaping to prevent injection
        content.innerText = text;
    } else {
        // Parse markdown output from Gemini using marked.js
        try {
            content.innerHTML = marked.parse(text);
        } catch (e) {
            content.innerText = text;
        }
    }

    wrapper.appendChild(label);
    wrapper.appendChild(content);
    bubble.appendChild(avatar);
    bubble.appendChild(wrapper);
    
    chatMessages.appendChild(bubble);
    scrollToBottom();
}

// Show thinking indicator
function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message-bubble model typing-container";
    indicator.id = "typing-indicator";
    
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

    const wrapper = document.createElement("div");
    wrapper.className = "message-content-wrapper";

    const label = document.createElement("div");
    label.className = "message-sender";
    label.innerText = "Gemini";

    const content = document.createElement("div");
    content.className = "message-text";
    
    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    content.appendChild(typing);
    wrapper.appendChild(label);
    wrapper.appendChild(content);
    indicator.appendChild(avatar);
    indicator.appendChild(wrapper);
    
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

// Remove thinking indicator
function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
        indicator.remove();
    }
}

// Handle Form Submission
async function handleFormSubmit(e) {
    if (e) e.preventDefault();
    
    const text = userInput.value.trim();
    if (!text) return;
    
    // Clear input field
    userInput.value = "";
    
    // Render user message bubble
    appendMessage("user", text);
    
    // Verify client is initialized
    if (!chatSession) {
        const initialized = initGemini();
        if (!initialized) return;
    }
    
    // Show typing/loading bubble
    showTypingIndicator();
    
    try {
        // Send request to Gemini API
        const response = await chatSession.sendMessage(text);
        const aiText = response.text;
        
        removeTypingIndicator();
        // Render bot response
        appendMessage("model", aiText);
    } catch (error) {
        console.error("API Call Failed:", error);
        removeTypingIndicator();
        
        let errorMsg = "An error occurred while contacting the Gemini API. Please check your internet connection.";
        
        if (error.message) {
            const msgLower = error.message.toLowerCase();
            if (msgLower.includes("quota") || msgLower.includes("429") || msgLower.includes("rate limit")) {
                errorMsg = "<strong>Quota Exceeded (429)</strong>: You have exceeded the free tier rate limit or quota for this model. Please wait a minute or verify your plan settings in Google AI Studio.";
            } else if (msgLower.includes("api key") || msgLower.includes("api_key") || msgLower.includes("invalid") || msgLower.includes("403") || msgLower.includes("400")) {
                errorMsg = "<strong>Authentication Error</strong>: Your API key appears to be invalid or restricted. Click the settings cog at the top to check or update your key.";
            } else {
                errorMsg = `<strong>API Error</strong>: ${error.message}`;
            }
        }
        
        showSystemMessage(errorMsg, "error");
    }
}

// UI Settings Modal handlers
function openSettingsModal() {
    apiKeyInput.value = apiKey;
    settingsModal.classList.add("active");
}

function closeSettingsModal() {
    settingsModal.classList.remove("active");
}

function saveSettings() {
    const newKey = apiKeyInput.value.trim();
    if (newKey !== apiKey) {
        apiKey = newKey;
        localStorage.setItem("GEMINI_API_KEY", apiKey);
        // Rebuild chat session with the new credentials
        initGemini();
        showSystemMessage("API key saved. Reinitialized Gemini session.", "info");
    }
    closeSettingsModal();
}

// Clear Chat Panel
function clearChat() {
    if (confirm("Are you sure you want to clear the conversation and restart?")) {
        chatMessages.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-icon">
                    <i class="fa-solid fa-sparkles"></i>
                </div>
                <h2>How can I help you today?</h2>
                <p>Ask anything! This chatbot is powered by Google's advanced Gemini AI. Start by typing a prompt below.</p>
                <div class="suggested-prompts">
                    <button class="suggested-btn">Write a poem about space</button>
                    <button class="suggested-btn">Explain quantum computing in simple terms</button>
                    <button class="suggested-btn">Help me debug a Python error</button>
                </div>
            </div>
        `;
        // Rebind click handlers for dynamically re-created suggested buttons
        rebindSuggestedButtons();
        // Reset chat history session
        if (genAI) {
            chatSession = model.startChat();
        }
    }
}

// Rebind handlers for dynamically created prompt buttons
function rebindSuggestedButtons() {
    const newButtons = document.querySelectorAll(".suggested-btn");
    newButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            userInput.value = btn.innerText;
            handleFormSubmit();
        });
    });
}

// Toggle password visibility field
function toggleApiKeyVisibility() {
    const type = apiKeyInput.type === "password" ? "text" : "password";
    apiKeyInput.type = type;
    
    const icon = toggleKeyVisibility.querySelector("i");
    if (type === "text") {
        icon.className = "fa-solid fa-eye-slash";
    } else {
        icon.className = "fa-solid fa-eye";
    }
}

// Set up Event Listeners
chatForm.addEventListener("submit", handleFormSubmit);
settingsBtn.addEventListener("click", openSettingsModal);
clearChatBtn.addEventListener("click", clearChat);
closeModalBtn.addEventListener("click", closeSettingsModal);
cancelSettingsBtn.addEventListener("click", closeSettingsModal);
saveSettingsBtn.addEventListener("click", saveSettings);
toggleKeyVisibility.addEventListener("click", toggleApiKeyVisibility);

// Listeners for Suggested Prompt clicks
suggestedButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        userInput.value = btn.innerText;
        handleFormSubmit();
    });
});

// Close modal when clicking outside contents
settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
        closeSettingsModal();
    }
});

// Initialize on Load
initGemini();
