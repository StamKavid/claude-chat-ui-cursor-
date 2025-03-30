// Import marked for markdown rendering
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(script);

// Import Prism for code syntax highlighting
const prismCSS = document.createElement('link');
prismCSS.rel = 'stylesheet';
prismCSS.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
document.head.appendChild(prismCSS);

const prismScript = document.createElement('script');
prismScript.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js';
document.head.appendChild(prismScript);

class ChatUI {
    constructor() {
        this.messagesContainer = document.getElementById('messages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.sidebar = document.querySelector('.claude-sidebar');
        this.sidebarToggle = document.querySelector('.sidebar-toggle');
        this.newChatButton = document.querySelector('.new-chat-button');
        this.settingsButton = document.querySelector('.settings-button');
        this.conversations = document.querySelectorAll('.conversation-item');
        
        this.isProcessing = false;
        this.currentConversationId = '1'; // Default to first conversation
        
        this.setupEventListeners();
        this.setupAutoResize();
        this.updateSendButtonState();
        
        // Add initial welcome message
        setTimeout(() => {
            this.addMessage("Hello! I'm Claude. How can I help you today?", false);
        }, 500);
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
        this.userInput.addEventListener('input', () => {
            this.updateSendButtonState();
        });

        // Sidebar toggle
        this.sidebarToggle.addEventListener('click', () => {
            this.sidebar.classList.toggle('expanded');
        });

        // New chat button
        this.newChatButton.addEventListener('click', () => {
            this.startNewConversation();
        });

        // Settings button
        this.settingsButton.addEventListener('click', () => {
            this.openSettings();
        });

        // Conversation selection
        this.conversations.forEach(item => {
            item.addEventListener('click', () => {
                this.selectConversation(item);
            });
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!this.sidebar.contains(e.target) && 
                    !this.sidebarToggle.contains(e.target) && 
                    this.sidebar.classList.contains('expanded')) {
                    this.sidebar.classList.remove('expanded');
                }
            }
        });

        // Handle keyboard navigation
        this.sidebar.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.innerWidth <= 768) {
                this.sidebar.classList.remove('expanded');
            }
        });
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            const newHeight = Math.min(this.userInput.scrollHeight, 200);
            this.userInput.style.height = newHeight + 'px';
        });
    }

    updateSendButtonState() {
        const isEmpty = !this.userInput.value.trim();
        this.sendButton.disabled = isEmpty || this.isProcessing;
        this.sendButton.style.opacity = isEmpty || this.isProcessing ? '0.5' : '1';
    }

    async handleSend() {
        const message = this.userInput.value.trim();
        if (!message || this.isProcessing) return;

        this.isProcessing = true;
        this.updateSendButtonState();

        // Add user message
        this.addMessage(message, true);
        
        // Clear input and reset height
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.updateSendButtonState();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate response (replace with actual API call)
        setTimeout(() => {
            this.hideTypingIndicator();
            
            // Sample response with various markdown formatting
            const response = `Thanks for your message! Here's a demonstration of my formatting capabilities:

## Markdown Support

I can format text in various ways:
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- ~~Strikethrough~~ for deleted content
- [Hyperlinks](https://www.anthropic.com)

### Code Examples

I can display code snippets with syntax highlighting:

\`\`\`javascript
// Example JavaScript function
function calculateSum(a, b) {
  return a + b;
}

// Using the function
const result = calculateSum(5, 7);
console.log(result); // 12
\`\`\`

### Lists

1. First ordered item
2. Second ordered item
3. Third ordered item

* Unordered list item
* Another item
* And another

> I can also display blockquotes like this one,
> which is useful for highlighting important information.`;

            this.addMessage(response, false);
            this.isProcessing = false;
            this.updateSendButtonState();
        }, 2000);
    }

    addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
        
        if (!isUser) {
            // Add Claude avatar for assistant messages
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            avatarDiv.innerHTML = `
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="18" fill="#FCF5F2" />
                    <path d="M18 27.8C12.6863 27.8 8.2 23.3137 8.2 18C8.2 12.6863 12.6863 8.2 18 8.2C23.3137 8.2 27.8 12.6863 27.8 18C27.8 23.3137 23.3137 27.8 18 27.8Z" stroke="#8E5B4C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18 22.4C15.5147 22.4 13.5 20.3853 13.5 18C13.5 15.6147 15.5147 13.5 18 13.5C20.4853 13.5 22.5 15.6147 22.5 18C22.5 20.3853 20.4853 22.4 18 22.4Z" stroke="#8E5B4C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            messageDiv.appendChild(avatarDiv);
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Configure marked options
        marked.setOptions({
            breaks: true, // Enable line breaks
            gfm: true,    // Enable GitHub Flavored Markdown
            highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            }
        });
        
        // Parse markdown and add to content
        contentDiv.innerHTML = marked.parse(content);
        
        messageDiv.appendChild(contentDiv);
        
        // Add message actions (copy button) for assistant messages
        if (!isUser) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button';
            copyButton.setAttribute('aria-label', 'Copy message');
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4v10h10V4H4zM3 2h12c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1z" fill="currentColor" />
                    <path d="M2 8H1V1c0-.6.4-1 1-1h7v1H2v7z" fill="currentColor" />
                </svg>
            `;
            
            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(content);
                    copyButton.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                    `;
                    setTimeout(() => {
                        copyButton.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4v10h10V4H4zM3 2h12c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1z" fill="currentColor" />
                                <path d="M2 8H1V1c0-.6.4-1 1-1h7v1H2v7z" fill="currentColor" />
                            </svg>
                        `;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text:', err);
                }
            });
            
            actionsDiv.appendChild(copyButton);
            messageDiv.appendChild(actionsDiv);
            
            // Add copy buttons to code blocks
            contentDiv.querySelectorAll('pre code').forEach(block => {
                const pre = block.parentElement;
                const copyButton = document.createElement('button');
                copyButton.className = 'action-button';
                copyButton.setAttribute('aria-label', 'Copy code');
                copyButton.style.position = 'absolute';
                copyButton.style.top = '8px';
                copyButton.style.right = '8px';
                copyButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4v10h10V4H4zM3 2h12c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1z" fill="currentColor" />
                        <path d="M2 8H1V1c0-.6.4-1 1-1h7v1H2v7z" fill="currentColor" />
                    </svg>
                `;
                
                copyButton.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(block.textContent);
                        copyButton.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        `;
                        setTimeout(() => {
                            copyButton.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4v10h10V4H4zM3 2h12c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1z" fill="currentColor" />
                                    <path d="M2 8H1V1c0-.6.4-1 1-1h7v1H2v7z" fill="currentColor" />
                                </svg>
                            `;
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                    }
                });
                
                pre.appendChild(copyButton);
            });
        }
        
        this.messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message assistant typing';
        
        // Add avatar to typing indicator
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#FCF5F2" />
                <path d="M18 27.8C12.6863 27.8 8.2 23.3137 8.2 18C8.2 12.6863 12.6863 8.2 18 8.2C23.3137 8.2 27.8 12.6863 27.8 18C27.8 23.3137 23.3137 27.8 18 27.8Z" stroke="#8E5B4C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 22.4C15.5147 22.4 13.5 20.3853 13.5 18C13.5 15.6147 15.5147 13.5 18 13.5C20.4853 13.5 22.5 15.6147 22.5 18C22.5 20.3853 20.4853 22.4 18 22.4Z" stroke="#8E5B4C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        indicator.appendChild(avatarDiv);
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        indicator.appendChild(typingDiv);
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = this.messagesContainer.querySelector('.typing');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    startNewConversation() {
        // Clear active state from all conversations
        this.conversations.forEach(conv => conv.classList.remove('active'));
        
        // Clear messages
        this.messagesContainer.innerHTML = '';
        
        // Reset current conversation ID
        this.currentConversationId = null;
        
        // Add welcome message
        this.addMessage("Hello! I'm Claude. How can I help you today?", false);
        
        // Focus input
        this.userInput.focus();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('expanded');
        }
    }

    selectConversation(item) {
        // Remove active class from all conversations
        this.conversations.forEach(conv => conv.classList.remove('active'));
        
        // Add active class to selected conversation
        item.classList.add('active');
        
        // Store current conversation ID
        this.currentConversationId = item.getAttribute('data-conversation-id');
        
        // Here you would typically load the conversation history
        // For now, we'll just add a placeholder message
        this.messagesContainer.innerHTML = '';
        this.addMessage(`Loading conversation ${this.currentConversationId}...`, false);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('expanded');
        }
    }

    openSettings() {
        // Placeholder for settings functionality
        console.log('Opening settings...');
    }
}

// Initialize chat UI when the page loads
window.addEventListener('load', () => {
    window.chatUI = new ChatUI();
}); 