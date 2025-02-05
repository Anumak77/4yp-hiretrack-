import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';

const JobSeekerChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedChat, setSelectedChat] = useState('Alice Johnson');

  const chatList = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Lee'];

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'Recruiter', text: input }]);
      setInput('');
    }
  };

  return (
    <main className="chat-container" style={{ backgroundColor: '#eddbcd', color: '#192231', padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <button type="button" className="back-button-jobposting" onClick={() => navigate('/dashboard-recruiter')} style={{ alignSelf: 'flex-start', marginBottom: '10px', paddingleft: '10px', marginLeft:'150px', backgroundColor: '#192231', color: '#f4f4f4', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>Go Back</button>
      <div className="chat-wrapper" style={{ display: 'flex', width: '80%', height: '80%', backgroundColor: '#f4f4f4', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
        <aside className="chat-sidebar" style={{ width: '25%', backgroundColor: '#f4f4f4', padding: '15px', borderRight: '2px solid #404a42' }}>
          <h2 style={{ color: '#192231', textAlign: 'center', marginBottom: '10px' }}>Chats</h2>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {chatList.map((chat, index) => (
              <li key={index} onClick={() => setSelectedChat(chat)}
                  style={{ padding: '10px', cursor: 'pointer', backgroundColor: selectedChat === chat ? '#c0b283' : 'transparent', borderRadius: '5px', marginBottom: '5px', textAlign: 'center' }}>
                {chat}
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <h1 className="chat-title" style={{ color: '#192231', textAlign: 'center', marginBottom: '10px' }}>Chat with {selectedChat}</h1>
          <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '10px', borderRadius: '5px', backgroundColor: '#f4f4f4' }}>
            {messages.length === 0 ? (
              <p style={{ color: '#404a42', textAlign: 'center' }}>No messages yet.</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} style={{
                  backgroundColor: msg.sender === 'Recruiter' ? '#c0b283' : '#eddbcd',
                  padding: '10px',
                  borderRadius: '10px',
                  margin: '5px 0',
                  maxWidth: '75%',
                  alignSelf: msg.sender === 'Recruiter' ? 'flex-end' : 'flex-start',
                  textAlign: 'left'
                }}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))
            )}
          </div>
          <div className="chat-input-container" style={{ display: 'flex', marginTop: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
              style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #404a42', marginRight: '10px' }}
            />
            <button onClick={handleSendMessage} className="chat-send-button" style={{ backgroundColor: '#192231', color: '#f4f4f4', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>Send</button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default JobSeekerChat;