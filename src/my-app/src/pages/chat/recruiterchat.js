import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from 'firebase/auth';
import "../../components/chat.css";

const RecruiterChat = () => {
  console.log("RecruiterChat component rendered"); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { applicantId } = useParams();
  const auth = getAuth();
  const user = auth.currentUser;

  /*
  useEffect(() => {
    console.log("useEffect 1: Setting selectedChat");
    const auth = getAuth();
    const user = auth.currentUser;
    const recruiterId = user.uid; 

    if (applicantId) {
      setSelectedChat(recruiterId + "_" + applicantId);
    }

    console.log(selectedChat)
  }, [applicantId]);

*/
  useEffect(() => {
    console.log("useEffect 2: Fetching recruiter chats");
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      navigate("/login"); 
      return;
    }

    const recruiterId = user.uid; 
    const fetchRecruiterChats = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/get_recruiter_chats?recruiter_id=${recruiterId}`
        );
        if (response.ok) {
          const data = await response.json();
          setChatList(data.chats);
          setLoading(false);
          if (applicantId) {
            const existingChat = data.chats.find(chat => 
              chat.applicantId === applicantId
            );
            
            if (existingChat) {
              setSelectedChat(existingChat.id);
            } else {
              const createResponse = await fetch("http://localhost:5000/create_chat", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  recruiter_id: recruiterId,
                  applicant_id: applicantId,
                }),
              });
              
              if (createResponse.ok) {
                const newChat = await createResponse.json();
                setChatList(prev => [...prev, { 
                  id: newChat.chat_id, 
                  applicantId,
                  applicantName: newChat.applicantName || "New Applicant"
                }]);
                setSelectedChat(newChat.chat_id);
              }
            }
          } else if (data.chats.length > 0) {
            // No specific applicant - select the first chat by default
            setSelectedChat(data.chats[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching recruiter chats:", error);
      }
    };

    fetchRecruiterChats(); 
  }, [navigate, applicantId]);


  useEffect(() => {
   /* const auth = getAuth();
    const user = auth.currentUser;
    const recruiterId = user.uid;

    console.log("useEffect 4: Chat History");
    if (applicantId) {
      setSelectedChat(recruiterId + "_" + applicantId);
    }
    console.log(selectedChat) */

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
      const auth = getAuth();
      const user = auth.currentUser;
      const sender_id = user.uid;

      /*

      console.log(selectedChat)

      if (applicantId) {
        setSelectedChat(sender_id + "_" + applicantId);
      }

      console.log(selectedChat)

        try {

          const payload = {
            sender_id: sender_id,
            recipient_id: applicantId,
            message: input,
          };
        
          console.log("Sending payload:", payload); */
        
        try{

          const response = await fetch("http://localhost:5000/send_message_recruiter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender_id: sender_id, 
              recipient_id: selectedChat.split('_')[1],
              message: input,
            }),
          });
    
          if (response.ok) {
            setInput("");
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
          <ul className = "chat-list">
            {loading ? (
              <p>Loading chats...</p>
            ) : chatList.length === 0 ? (
              <p>No chats yet.</p>
            ) : (
              chatList.map((chat) => (
                <li
                  key={chat.id}
                  className={`chat-list-item ${
                    selectedChat === chat.id ? "selected-chat" : ""
                  }`}
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
        {!selectedChat && chatList.length === 0 && !loading ? (
          <div className="empty-inbox">
            <h2>Your inbox is empty</h2>
            <p>Start a new chat by selecting an applicant</p>
          </div>
        ) : (
          <>
            <h1 className="chat-title">
              {selectedChat ? 
                `Chat with ${chatList.find(c => c.id === selectedChat)?.applicantName || 'Applicant'}` : 
                "Select a chat from the sidebar"}
            </h1>

            <div className="messages-container">
              {messages.length === 0 ? (
                <p className="no-messages">
                  {selectedChat ? "No messages yet" : "Please select a chat"}
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                     msg.sender === user.uid ? "recruiter-message" : "seeker-message"
                    }`}
                  >
                    <strong>{msg.sender === user.uid ? "You" : "Applicant"}:</strong> {msg.text}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Area - Only show when a chat is selected */}
            {selectedChat && (
              <div className="chat-input-container">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="chat-input"
                />
                <button
                  onClick={handleSendMessage}
                  className="chat-send-button"
                >
                  Send
                </button>
              </div>
            )}
          </>
        )}
      </section>
      </div>
    </main>
  );
};

export default RecruiterChat;