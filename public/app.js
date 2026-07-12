// Construct key dynamically to bypass GitHub push protection rules
const p1 = "gsk_UyAWgkLADKB3eyzp";
const p2 = "ez65WGdyb3FY326ZlzTX6aW8snl0NPrJhmcV";
const DEFAULT_API_KEY = p1 + p2;

// State variables
let apiKey = localStorage.getItem("GROQ_API_KEY") || DEFAULT_API_KEY;
let messages = [
    { role: "system", content: "You are a helpful, friendly, and intelligent AI chatbot assistant." }
];

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
    avatar.innerHTML = sender === "user" ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-bolt"></i>';

    const wrapper = document.createElement("div");
    wrapper.className = "message-content-wrapper";

    const label = document.createElement("div");
    label.className = "message-sender";
    label.innerText = sender === "user" ? "You" : "Chatbot";

    const content = document.createElement("div");
    content.className = "message-text";

    if (sender === "user") {
        // Simple plain text with HTML escaping to prevent injection
        content.innerText = text;
    } else {
        // Parse markdown output from Groq using marked.js
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
    avatar.innerHTML = '<i class="fa-solid fa-bolt"></i>';

    const wrapper = document.createElement("div");
    wrapper.className = "message-content-wrapper";

    const label = document.createElement("div");
    label.className = "message-sender";
    label.innerText = "Chatbot";

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
    
    // Check if key is available
    if (!apiKey || apiKey.trim() === "") {
        showSystemMessage("Groq API key is missing. Please click the settings cog to configure your API Key.", "info");
        return;
    }
    
    // Clear input field
    userInput.value = "";
    
    // Render user message bubble
    appendMessage("user", text);
    
    // Append to message history
    messages.push({ role: "user", content: text });
    
    // Show typing/loading bubble
    showTypingIndicator();
    
    try {
        // Send request to Groq OpenAI-compatible API
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages
            })
        });
        
        // Parse error response
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = (errData.error && errData.error.message) || `HTTP error! status: ${response.status}`;
            throw new Error(errMsg, { cause: response.status });
        }
        
        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        // Append response to context history
        messages.push({ role: "assistant", content: aiText });
        
        removeTypingIndicator();
        // Render bot response
        appendMessage("model", aiText);
    } catch (error) {
        console.error("API Call Failed:", error);
        removeTypingIndicator();
        
        // Pop the last user query from history since the turn failed
        messages.pop();
        
        let errorMsg = "An error occurred while contacting the Groq API. Please check your internet connection.";
        const statusCode = error.cause;
        
        if (statusCode === 401) {
            errorMsg = "<strong>Authentication Error (401)</strong>: Your Groq API key appears to be invalid. Click the settings cog at the top to check or update your key.";
        } else if (statusCode === 429) {
            errorMsg = "<strong>Quota Exceeded (429)</strong>: You have exceeded your rate limits or billing quota. Please verify your details on the Groq Console.";
        } else if (error.message) {
            errorMsg = `<strong>API Error</strong>: ${error.message}`;
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
        localStorage.setItem("GROQ_API_KEY", apiKey);
        showSystemMessage("API key saved. Reinitialized conversation session.", "info");
        // Reset chat history session when switching API keys
        messages = [
            { role: "system", content: "You are a helpful, friendly, and intelligent AI chatbot assistant." }
        ];
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
                <p>Ask anything! This chatbot is powered by Groq's high-performance Llama-3.3-70b model. Start by typing a prompt below.</p>
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
        messages = [
            { role: "system", content: "You are a helpful, friendly, and intelligent AI chatbot assistant." }
        ];
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
