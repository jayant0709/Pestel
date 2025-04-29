import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const ChatWindow = ({ reportData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const preprocessMessage = (text) => {
    if (!text) return '';
    
    // Remove markdown headers (#)
    text = text.replace(/^#+\s*/gm, '');
    
    // Convert **text** to regular text
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Remove any remaining markdown characters
    text = text.replace(/[*#_~`]/g, '');
    
    // Clean up extra whitespace
    text = text.replace(/\n\s*\n/g, '\n').trim();
    
    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Add user message
      const userMessage = { text: message, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      setMessage('');

      // Send to API
      const response = await fetch('https://app-362387414228.us-central1.run.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          reportContext: reportData?.message || ''
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Add AI response with preprocessing
      setMessages(prev => [...prev, { 
        text: preprocessMessage(data.message), 
        sender: 'ai' 
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="absolute bottom-0 right-0 w-96 h-[500px] bg-white rounded-xl shadow-2xl border-0 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-blue-500">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about the report..."
                className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-400 bg-gray-50"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
