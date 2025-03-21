import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from 'firebase/auth';
import "../../components/style.css";

const RecruiterChat = () => {
  console.log("RecruiterChat component rendered"); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { applicantId } = useParams();

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
        } else {
          console.error("Failed to fetch recruiter chats");
        }
      } catch (error) {
        console.error("Error fetching recruiter chats:", error);
      }
    };

    fetchRecruiterChats(); 
  }, [navigate]);

  useEffect(() => {
    console.log("useEffect 3: Creating new chat");
    console.log(selectedChat)
    const auth = getAuth();
    const user = auth.currentUser;
    const recruiterId = user.uid;


    if (applicantId) {
      setSelectedChat(recruiterId + "_" + applicantId);
    }

    const chatExists = chatList.some((chat) => chat.id === `${recruiterId}_${applicantId}`);

    if (!chatExists){
    const createNewChat = async () => {

      if (!recruiterId || !applicantId) {
        console.error("Recruiter ID or Applicant ID is missing");
        return;
      }

        const payload = {
          recruiter_id: recruiterId,
          applicant_id: applicantId,
        };
        console.log("Payload:", payload);

      try {
        const response = await fetch("http://localhost:5000/create_chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recruiter_id: recruiterId,
            applicant_id: applicantId,
          }),
        });

        console.log(response)

        if (response.ok) {
          const data = await response.json();
          setChatList((prevChats) => [
            ...prevChats,
            { id: data.chat_id, messages: [] },
          ]);
        } else {
          console.error("Failed to create new chat");
        }
      } catch (error) {
        console.error("Error creating new chat:", error);
      }
    };

    createNewChat();
  }
  }, [navigate, applicantId]);


  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const recruiterId = user.uid;

    console.log("useEffect 4: Chat History");
    if (applicantId) {
      setSelectedChat(recruiterId + "_" + applicantId);
    }
    console.log(selectedChat)
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
        
          console.log("Sending payload:", payload);

          const response = await fetch("http://localhost:5000/send_message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender_id: sender_id, 
              recipient_id: applicantId,
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
                  {chat.applicantName} {/* Display applicant's name */}
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Chat Box */}
        <section className="chat-box">
          <h1 className="chat-title">
          Chat with{" "} {selectedChat? chatList.find((chat) => chat.id === selectedChat)?.applicantName: "Select a chat"}
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