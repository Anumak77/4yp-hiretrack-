import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from 'firebase/auth';
import "../../components/chat.css";

const JobseekerChat = () => {
  console.log("RecruiterChat component rendered"); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]); 
  const [loading, setLoading] = useState(true);

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

    const applicantId = user.uid; 
    const fetchJobseekerChats = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/get_applicant_chats?applicant_id=${applicantId}`
        );
        if (response.ok) {
          const data = await response.json();
          setChatList(data.chats);
          setLoading(false);
        }
      }
      catch (error) {
        console.error("Error fetching recruiter chats:", error);
    }
    }
    fetchJobseekerChats(); 
  }, [navigate]);


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

          const response = await fetch("http://localhost:5000/send_message", {
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
                  {chat.recruiterName} {/* Display applicant's name */}
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
                `Chat with ${chatList.find(c => c.id === selectedChat)?.recruiterName || 'Recruiter'}` : 
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
                      msg.sender === "Applcant"
                        ? "recruiter-message"
                        : "seeker-message"
                    }`}
                  >
                    <strong>{msg.sender === "Applicant" ? "You" : "Recruiter"}:</strong> {msg.text}
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

export default JobseekerChat;