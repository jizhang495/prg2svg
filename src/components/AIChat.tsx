import { useState, useRef, useEffect } from 'react';
import './AIChat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  currentCode: string;
  onCodeUpdate: (newCode: string) => void;
  onRender: (code?: string) => void;
}

export function AIChat({ currentCode, onCodeUpdate, onRender }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractCodeFromResponse = (text: string): string | null => {
    const codeBlockRegex = /```(?:prg)?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check for /clear command
    if (input.trim() === '/clear') {
      setMessages([]);
      setInput('');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          currentCode: currentCode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };

      setMessages([...newMessages, assistantMessage]);

      // Extract and apply code if present
      const extractedCode = extractCodeFromResponse(data.response);
      if (extractedCode) {
        onCodeUpdate(extractedCode);
        // Automatically render with the new code
        onRender(extractedCode);
      }
    } catch (error: any) {
      console.error('Chat error:', error);

      // Don't show error message if request was aborted
      if (error.name === 'AbortError') {
        const cancelMessage: Message = {
          role: 'assistant',
          content: 'Request cancelled.',
        };
        setMessages([...newMessages, cancelMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please make sure the server is running and try again.',
        };
        setMessages([...newMessages, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <h2>AI Assistant</h2>
        <p>Ask me to modify your PRG code</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="welcome-icon">🤖</div>
            <h3>Hi! I'm your PRG assistant</h3>
            <p>I can help you modify your printing code. Try asking:</p>
            <ul>
              <li>"Delete some parts to make one rectangle instead of four"</li>
              <li>"Add a circle in the center"</li>
              <li>"Make all shapes twice as large"</li>
              <li>"Add comments explaining each section"</li>
            </ul>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me to modify your PRG code... (type /clear to reset)"
          rows={2}
          disabled={isLoading}
        />
        <div className="chat-buttons">
          {isLoading ? (
            <button
              className="chat-stop-button"
              onClick={stopGeneration}
            >
              Stop
            </button>
          ) : (
            <button
              className="chat-send-button"
              onClick={sendMessage}
              disabled={!input.trim()}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
