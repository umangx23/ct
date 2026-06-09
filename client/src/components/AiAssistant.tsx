import React, { useState, useEffect, useRef } from 'react';
import './AiAssistant.css';

interface PortionOption {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PortionSuggestion {
  foodName: string;
  options: PortionOption[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  image?: string;
  portionSuggestion?: PortionSuggestion;
}

interface AiAssistantProps {
  onMealLogged: () => void;
  prefillMessage: string | null;
  onClearPrefill: () => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onMealLogged, prefillMessage, onClearPrefill }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    if (prefillMessage) {
      setInputText(prefillMessage);
      onClearPrefill();
    }
  }, [prefillMessage]);
  const [sending, setSending] = useState<boolean>(false);
  const [scanning, setScanning] = useState<string | null>(null); // 'photo' | 'voice' | null
  
  const chatFeedRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages, scanning]);

  // Send message
  const handleSendMessage = async (textToSend: string, imageToSend: string | null = null) => {
    if (!textToSend.trim() && !imageToSend) return;
    
    try {
      setSending(true);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, image: imageToSend })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(data.chatHistory);
        setInputText('');

        // If the reply contains logged text, trigger refresh in App.tsx
        const lastMsg = data.newMessages[data.newMessages.length - 1];
        if (lastMsg && lastMsg.text && lastMsg.text.includes('automatically logged')) {
          onMealLogged();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  // Click portion suggestion option
  const handleSelectPortion = (optionLabel: string) => {
    handleSendMessage(optionLabel);
  };

  // Mock Photo Upload Scan
  const handleMockPhotoUpload = () => {
    setScanning('photo');
    setTimeout(() => {
      setScanning(null);
      // Send message representing the photo upload
      handleSendMessage(
        "Just grabbed this grilled chicken salad from the cafe.",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"
      );
    }, 1500);
  };

  // Mock Voice Recording Scan
  const handleMockVoiceRecord = () => {
    setScanning('voice');
    setTimeout(() => {
      setScanning(null);
      setInputText("I had oatmeal and blueberries for breakfast");
    }, 1200);
  };

  // Clear Chat History
  const handleClearHistory = async () => {
    if (window.confirm('Clear all chat history?')) {
      try {
        const res = await fetch('/api/chat', { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  return (
    <div className="chat-container animate-fade-in">
      {/* Scanning Banner */}
      {scanning === 'photo' && (
        <div className="scanning-toast">
          <span className="material-symbols-outlined animate-spin icon-toast">sync</span>
          AI Scanning food photo...
        </div>
      )}
      {scanning === 'voice' && (
        <div className="scanning-toast">
          <span className="material-symbols-outlined animate-pulse icon-toast icon-error">mic</span>
          Listening to your description...
        </div>
      )}

      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="online-indicator">
            <span className="online-dot"></span>
            Online
          </div>
        </div>
        <button className="clear-chat-btn" onClick={handleClearHistory} title="Reset chat history">
          Clear Conversation
        </button>
      </div>

      {/* Chat Feed */}
      <div className="chat-feed no-scrollbar" ref={chatFeedRef}>
        <div className="timestamp-divider">Today</div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            <div className="chat-avatar">
              <span className="material-symbols-outlined icon-chat-avatar">
                {msg.sender === 'ai' ? 'smart_toy' : 'person'}
              </span>
            </div>
            
            <div className="message-column">
              <div className="message-bubble">
                {msg.sender === 'ai' && msg.portionSuggestion && (
                  <div className="ai-scan-badge">
                    <span className="material-symbols-outlined icon-badge">verified</span>
                    AI Scanned
                  </div>
                )}
                
                {msg.image && (
                  <div className="message-image">
                    <img src={msg.image} alt="Scanned meal" />
                  </div>
                )}
                
                <p className="message-text">
                  {/* Clean bold parsing for mock messages */}
                  {msg.text.split('**').map((part, index) => 
                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                  )}
                </p>
              </div>

              {/* Portion Options Buttons (AI Suggestion only) */}
              {msg.sender === 'ai' && msg.portionSuggestion && (
                <div className="portion-suggestions animate-fade-in">
                  {msg.portionSuggestion.options.map((opt, oIdx) => (
                    <button 
                      key={oIdx} 
                      className="portion-option-btn"
                      onClick={() => handleSelectPortion(opt.label)}
                      disabled={sending}
                    >
                      <span>{opt.label}</span>
                      {opt.calories > 0 && (
                        <span className="portion-calories">{opt.calories} kcal</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <div className="input-container-inner">
          <button 
            type="button" 
            className="input-icon-btn" 
            title="Scan Food Photo"
            onClick={handleMockPhotoUpload}
            disabled={sending || scanning !== null}
          >
            <span className="material-symbols-outlined">add_a_photo</span>
          </button>
          
          <textarea
            className="chat-textarea no-scrollbar"
            placeholder="Describe your meal (e.g. 'I had a salad bowl')..."
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || scanning !== null}
          />

          <div className="input-actions-right">
            <button 
              type="button" 
              className="input-icon-btn" 
              title="Voice Input"
              onClick={handleMockVoiceRecord}
              disabled={sending || scanning !== null}
            >
              <span className="material-symbols-outlined">mic</span>
            </button>
            <button 
              type="submit" 
              className="send-msg-btn"
              disabled={sending || !inputText.trim() || scanning !== null}
              title="Send Message"
            >
              <span className="material-symbols-outlined icon-chat-avatar">send</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AiAssistant;
