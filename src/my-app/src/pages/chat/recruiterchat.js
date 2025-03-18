import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, addDoc, query, where, onSnapshot, orderBy } from "./../components/firebaseconfigs";
import { getAuth } from 'firebase/auth';
import "../../components/style.css";

const RecruiterChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicantId) {
      setSelectedChat(applicantId);
    }
  }, [applicantId]);


  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      navigate("/login"); 
      return;
    }

    const recruiterId = user.uid; 
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("recruiterId", "==", recruiterId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatList(chats);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, [navigate]);


  useEffect(() => {
    if (selectedChat) {
        const fetchChatHistory = async () => {
          try {
            const response = await fetch(
              `http://localhost:5000/get_chat_history?chat_id=${selectedChat}`
            );
            if (response.ok) {
              const data = await response.json();
              setMessages(data.messages);
            } else {
              console.error("Failed to fetch chat history");
            }
          } catch (error) {
            console.error("Error fetching chat history:", error);
          }
        };
    
        fetchChatHistory();
      }
    }, [selectedChat]);


  const handleSendMessage = async () => {
    if (input.trim() && selectedChat) {
        try {
          const response = await fetch("http://localhost:5000/send_message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender_id: "recruiter_id", 
              recipient_id: selectedChat,
              message: input,
            }),
          });
    
          if (response.ok) {
            setInput("");
          } else {
            console.error("Failed to send message");
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
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
            {loading ? (
              <p>Loading chats...</p>
            ) : chatList.length === 0 ? (
              <p>No chats yet.</p>
            ) : (
              chatList.map((chat) => (
                <li
                  key={chat.id}
                  className={selectedChat === chat.id ? "selected-chat" : ""}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  {chat.applicantName} {/* Display applicant's name */}
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Chat Box */}
        <section className="chat-box">
          <h1 className="chat-title">
            Chat with {selectedChat ? chatList.find((chat) => chat.id === selectedChat)?.applicantName : "Select a chat"}
          </h1>

          <div className="messages-container">
            {messages.length === 0 ? (
              <p className="no-messages">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
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
              disabled={!selectedChat} // Disable input if no chat is selected
            />
            <button
              onClick={handleSendMessage}
              className="chat-send-button"
              disabled={!selectedChat} 
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default RecruiterChat;