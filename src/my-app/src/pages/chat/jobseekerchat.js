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
  const auth = getAuth();
  const user = auth.currentUser;

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
      try {

        const [recruiterId, applicantId] = selectedChat.split('_');

        const response = await fetch("http://localhost:5000/send_message_jobseeker", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_id: applicantId,
            recipient_id: recruiterId,
            message: input,
          }),
        });

        console.log(recruiterId + "recruiter id")
        console.log(applicantId + "applicant id")
        console.log(selectedChat.split("_")[0])

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

  //   const handleFetchStructuredCV = async () => {
  //     try {
  //       const user = auth.currentUser;
  //       if (!user) {
  //         console.error("No user found");
  //         return;
  //       }
  //       const response = await fetch(`http://localhost:5000/api/fetch-structured-cv?uid=${user.uid}`);
  //       const data = await response.json();
  //       console.log(data);

  //       if (response.status === 404 || !data.success) {
  //         alert("No structured CV found."); 
  //       } else {
  //         navigate('/recruiter_preview_cv', { state: { cvData: data.cvData, jobSeeker: { uid: user.uid, first_name: "You" } } });
  //       }
  //     } catch (error) {
  //       console.error('Error fetching structured CV:', error);
  //       alert("Something went wrong while fetching the CV!");
  //     }
  // };


  const sendCustomMessage = async (customText) => {
    if (!selectedChat) {
      alert("Please select a chat first.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    const sender_id = user.uid;

    try {
      const [recruiterId, applicantId] = selectedChat.split('_');

      const response = await fetch("http://localhost:5000/send_message_jobseeker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: applicantId,
          recipient_id: recruiterId,
          message: customText,
        }),
      });

      if (response.ok) {
        setInput("");
        const data = await response.json();
        console.log("Message sent:", data);
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
  };

  const sendCustomViewCVRequest = async () => {
    if (!selectedChat) {
      alert("Please select a chat first.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    try {
      const [recruiterId, applicantId] = selectedChat.split('_');

      const response = await fetch("http://localhost:5000/send_message_jobseeker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: applicantId,
          recipient_id: recruiterId,
          message: `VIEW_CV_REQUEST|${applicantId}`,
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
  };



  return (


    <main className="chat-container">



      <button
        type="button"
        className="back-button-chat"
        onClick={() => navigate("/dashboard-recruiter")}
      >
        Go Back
      </button>

      <div className="chat-wrapper">
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
                  {chat.recruiterName}
                </li>
              ))
            )}
          </ul>
        </aside>


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
                      className={`message ${msg.sender === user.uid ? "recruiter-message" : "seeker-message"
                        }`}
                    >
                      {msg.text.startsWith("VIEW_CV_REQUEST") ? (
                        <div className="view-cv-request">
                          <strong>You requested CV view</strong> <br />
                          <button className="disabled-button" disabled>
                            View Structured CV
                          </button>
                        </div>
                      ) : (
                        <>
                          <strong>{msg.sender === user.uid ? "You" : "Recruiter"}:</strong> {msg.text}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>


              <div className="flex gap-4 mt-4">
                <button
                  className="job-details__button bg-blue-500 text-white pl-40"

                  onClick={() => sendCustomMessage("Hi! How are you doing today?")}
                >
                  Send Hi
                </button>

                <button
                  className="job-details__button bg-green-500 text-white"
                  onClick={sendCustomViewCVRequest}
                >
                  Ask to View Structured CV
                </button>
              </div>

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