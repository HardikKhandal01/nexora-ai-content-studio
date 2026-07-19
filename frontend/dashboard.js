const API_BASE_URL = "https://nexora-backend-m37r.onrender.com";
const token = localStorage.getItem('nexora_token');

if (!token) window.location.href = "index.html";

const logoutBtn = document.getElementById('logoutBtn');
const toolListItems = document.querySelectorAll('#toolList li');
const currentToolTitle = document.getElementById('currentToolTitle');
const aiPrompt = document.getElementById('aiPrompt');
const generateBtn = document.getElementById('generateBtn');
const chatContainer = document.getElementById('chatContainer');
const emptyState = document.getElementById('emptyState');
const emptyStateText = document.getElementById('emptyStateText');

let currentTool = "Blog Generator";

// MEMORY: Har tool ki chat history save rakhne ke liye object
let chatMemory = {}; 

// --- NEW SIDEBAR LOGIC ---
const hamburgerBtn = document.getElementById('hamburgerBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Open/Close toggle function
function toggleSidebar() {
    sidebar.classList.toggle('open');
    if(sidebar.classList.contains('open')) {
        sidebarOverlay.classList.add('show');
    } else {
        sidebarOverlay.classList.remove('show');
    }
}

hamburgerBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', toggleSidebar);
historyBtn.addEventListener('click', toggleSidebar); // History khulte hi sidebar hide ho jaye

// --- CORE FUNCTIONS ---

// 1. Render Chat (Tool switch hone par old chat wapas laana)
function renderChat() {
    chatContainer.innerHTML = ''; // Box clear karo
    
    // Agar is tool ki koi memory nahi hai
    if (!chatMemory[currentTool] || chatMemory[currentTool].length === 0) {
        chatContainer.appendChild(emptyState);
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    // Memory se messages read karke UI par lagao
    chatMemory[currentTool].forEach(msg => {
        appendMessage(msg.role, msg.content, false);
    });
    scrollToBottom();
}

// 2. Append Message (Bubble banakar screen par dikhana)
function appendMessage(role, content, saveToMemory = true) {
    emptyState.style.display = 'none';

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message');
    msgDiv.classList.add(role === 'user' ? 'user-message' : 'ai-message');

    if (role === 'ai') {
        // AI message me formatting aur copy button add karna
        const parsedContent = marked.parse(content);
        msgDiv.innerHTML = `
            <button class="msg-copy-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
            <div class="msg-content">${parsedContent}</div>
        `;
        
        // Copy functionality for this specific bubble
        const copyBtn = msgDiv.querySelector('.msg-copy-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(content).then(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: var(--sky-blue)"></i>';
                setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
            });
        });
    } else {
        msgDiv.textContent = content;
    }

    chatContainer.appendChild(msgDiv);
    
    if (saveToMemory) {
        if (!chatMemory[currentTool]) chatMemory[currentTool] = [];
        chatMemory[currentTool].push({ role, content });
    }
    
    scrollToBottom();
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// --- EVENT LISTENERS ---

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('nexora_token');
    window.location.href = "index.html";
});

// Sidebar Tool Switching
toolListItems.forEach(item => {
    item.addEventListener('click', () => {
        toolListItems.forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        
        currentTool = item.getAttribute('data-tool');
        currentToolTitle.innerText = currentTool;
        emptyStateText.innerText = `Welcome to ${currentTool}. What would you like to create?`;
        aiPrompt.value = "";
        
        renderChat(); // Naya tool select hote hi uski purani chat load karo!

        // --- NEW LINE: Mobile me tool select karte hi sidebar apne aap band ho jaye ---
        if(window.innerWidth <= 768) {
            toggleSidebar();
        }
    });
});

// Textarea Auto-resize (ChatGPT jaisa feel)
aiPrompt.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Generate Content
generateBtn.addEventListener('click', async () => {
    const promptText = aiPrompt.value.trim();
    if (!promptText) return;

    // 1. User ka message UI aur Memory me add karo
    appendMessage('user', promptText);
    aiPrompt.value = '';
    aiPrompt.style.height = 'auto'; // reset height

    // 2. Loading State (Temporary AI bubble)
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('chat-message', 'ai-message');
    loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating...';
    chatContainer.appendChild(loadingDiv);
    scrollToBottom();

    // 3. API Call
    try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tool_name: currentTool,
                prompt: `Act as an expert for ${currentTool}. User requirement: ${promptText}. 
                CRITICAL INSTRUCTIONS: 
                1. You MUST respond in the EXACT SAME LANGUAGE and SCRIPT as the user's requirement. 
                2. If the user writes in 'Hinglish' (Hindi words written in English letters), YOU MUST REPLY IN HINGLISH using English alphabet. Do NOT use Devanagari script.
                3. If the user writes in English, reply in English.
                4. Mirror the user's conversational tone while providing highly professional, well-structured output.`
            })
        });

        if (!response.ok) throw new Error("Failed to generate content.");
        const data = await response.json();
        
        // 4. Remove loading bubble and show real AI message
        chatContainer.removeChild(loadingDiv);
        appendMessage('ai', data.generated_text);
        
    } catch (error) {
        chatContainer.removeChild(loadingDiv);
        appendMessage('ai', `**Error:** ${error.message}`);
    }
});

// Enter key press par send karna (Shift+Enter for new line)
aiPrompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateBtn.click();
    }
});
// --- HISTORY PANEL LOGIC ---

const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('historyList');

// Open History Panel & Fetch Data
historyBtn.addEventListener('click', async () => {
    historyModal.classList.remove('hidden');
    
    // Show Loading
    historyList.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Fetching your past chats from database...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load history.");
        const data = await response.json();

        // Agar history khali hai
        if (data.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-clock"></i>
                    <p>No history found yet. Start generating!</p>
                </div>
            `;
            return;
        }

        // Data show karna
        historyList.innerHTML = '';
        data.forEach(item => {
            const dateStr = new Date(item.created_at).toLocaleString('en-US', { 
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            const histDiv = document.createElement('div');
            histDiv.classList.add('history-item');
            histDiv.innerHTML = `
                <div class="hist-header">
                    <span class="hist-tool"><i class="fa-solid fa-bolt"></i> ${item.tool_name}</span>
                    <span class="hist-date">${dateStr}</span>
                </div>
                <div class="hist-prompt"><strong>Prompt:</strong> ${item.prompt_input}</div>
            `;

            // Click karne par history load karna
            histDiv.addEventListener('click', () => {
                // Tool switch karo
                currentTool = item.tool_name;
                currentToolTitle.innerText = currentTool;
                
                toolListItems.forEach(li => {
                    li.classList.remove('active');
                    if(li.getAttribute('data-tool') === currentTool) li.classList.add('active');
                });

                // Chat memory me wapas daalo aur render karo
                if (!chatMemory[currentTool]) chatMemory[currentTool] = [];
                
                // Add to memory
                chatMemory[currentTool].push({ role: 'user', content: item.prompt_input });
                chatMemory[currentTool].push({ role: 'ai', content: item.generated_content });

                renderChat(); // UI refresh
                historyModal.classList.add('hidden'); // Modal close
            });

            historyList.appendChild(histDiv);
        });

    } catch (error) {
        historyList.innerHTML = `<div class="empty-state" style="color: #ff6b6b;"><p>${error.message}</p></div>`;
    }
});

// Close History Modal
closeHistoryModal.addEventListener('click', () => {
    historyModal.classList.add('hidden');
});
// --- EXPORT TO DOCUMENT FEATURE ---
const exportBtn = document.getElementById('exportBtn');

exportBtn.addEventListener('click', () => {
    // Chat container me jo text hai usko fetch karna
    let contentToExport = "";
    const messages = chatContainer.querySelectorAll('.chat-message');
    
    if (messages.length === 0 || document.getElementById('emptyState').style.display !== 'none') {
        alert("No content to download!");
        return;
    }

    messages.forEach(msg => {
        if (msg.classList.contains('user-message')) {
            contentToExport += `\n--- PROMPT ---\n${msg.innerText}\n\n`;
        } else {
            // Remove 'Copy' text from the AI message parsing
            let aiText = msg.innerText.replace('Copy', '').trim();
            contentToExport += `--- AI RESULT ---\n${aiText}\n\n=========================\n`;
        }
    });

    // Create and download a .txt file
    const blob = new Blob([contentToExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexora_${currentTool.replace(/\s+/g, '_')}_Content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});