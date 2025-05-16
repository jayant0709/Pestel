import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const ChatWindow = ({ reportData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const preprocessMessage = (text) => {
    if (!text) return "";

    // Remove markdown headers (#)
    text = text.replace(/^#+\s*/gm, "");

    // Convert **text** to regular text
    text = text.replace(/\*\*(.*?)\*\*/g, "$1");

    // Remove any remaining markdown characters
    text = text.replace(/[*#_~`]/g, "");

    // Clean up extra whitespace
    text = text.replace(/\n\s*\n/g, "\n").trim();

    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Add user message
      const userMessage = { text: message, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setMessage("");

      // Send to API
      const response = await fetch(
        "https://app-362387414228.us-central1.run.app/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            reportContext: reportData?.message || "",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // Add AI response with preprocessing
      setMessages((prev) => [
        ...prev,
        {
          text: preprocessMessage(data.message),
          sender: "ai",
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
        },
      ]);
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
    <div
      className={`fixed z-50 ${
        isOpen ? "bottom-0" : "-bottom-[500px]"
      } right-4 w-96 max-h-[500px] bg-gray-900 rounded-t-xl shadow-xl transition-all duration-300`}
    >
      {/* Chat Header */}
      <div className="p-4 bg-gray-800 rounded-t-xl flex items-center justify-between">
        <h3 className="text-white font-semibold">Chat Assistant</h3>
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
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-400 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about the report..."
            className="flex-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
            disabled={isLoading}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 p-3.5 bg-blue-400 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
