import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/style.css";

const JobSeekerChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState("Alice Johnson");

  const chatList = ["Alice Johnson", "Bob Smith", "Charlie Davis", "Diana Lee"];

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: "Recruiter", text: input }]);
      setInput("");
    }
  };

  return (
    <main className="chat-container">
      {/* Back Button */}
      <button
        type="button"
        className="back-button-chat"
        onClick={() => navigate("/dashboard-recruiter")}
      >
        Go Back
      </button>

      <div className="chat-wrapper">
        {/* Chat Sidebar */}
        <aside className="chat-sidebar">
          <h2>Chats</h2>
          <ul>
            {chatList.map((chat, index) => (
              <li
                key={index}
                className={selectedChat === chat ? "selected-chat" : ""}
                onClick={() => setSelectedChat(chat)}
              >
                {chat}
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat Box */}
        <section className="chat-box">
          <h1 className="chat-title">Chat with {selectedChat}</h1>

          <div className="messages-container">
            {messages.length === 0 ? (
              <p className="no-messages">No messages yet.</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === "Recruiter"
                      ? "recruiter-message"
                      : "seeker-message"
                  }`}
                >
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))
            )}
          </div>

          {/* Chat Input Area */}
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button onClick={handleSendMessage} className="chat-send-button">
              Send
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default JobSeekerChat;
