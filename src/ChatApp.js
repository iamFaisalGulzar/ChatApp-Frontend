// frontend/src/ChatApp.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to Socket.io server on port 4000
const socket = io("http://35.180.138.52:4000", {
  transports: ["websocket", "polling"], 
  withCredentials: true
});

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // Register the user
  const registerUser = () => {
    if (username.trim()) {
      socket.emit('register', username);
      setRegistered(true);
    }
  };

  // Listen for messages and user list updates
  useEffect(() => {
    socket.on('chat message', (data) => {
      setChatMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('user list', (userList) => {
      setUsers(userList.filter((user) => user !== username)); // Exclude self
    });

    return () => {
      socket.off('chat message');
      socket.off('user list');
    };
  }, [username]);

  // Send a private message
  const sendMessage = () => {
    if (message.trim() && recipient) {
      socket.emit('private message', {
        recipient: recipient,
        message: message,
      });
      setMessage('');
    }
  };

  return (
    <div>
      <h1>React Chat App</h1>

      {!registered ? (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <button onClick={registerUser}>Register</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}!</h2>
          <div>
            <label>Send message to:</label>
            <select onChange={(e) => setRecipient(e.target.value)} value={recipient}>
              <option value="">Select user</option>
              {users.map((user, index) => (
                <option key={index} value={user}>{user}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
            />
            <button onClick={sendMessage}>Send</button>
          </div>

          <div>
            <h2>Messages:</h2>
            <ul>
              {chatMessages.map((msg, index) => (
                <li key={index}>
                  <strong>{msg.sender}:</strong> {msg.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
