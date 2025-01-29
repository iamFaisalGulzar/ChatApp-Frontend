// frontend/src/ChatApp.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');  // Connect to Socket.io server on port 4000

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  console.log({users})
  // Handle user registration
  const registerUser = () => {
    if (username.trim()) {
      socket.emit('register', username);  // Send username to server
      setRegistered(true);
      console.log(`${username} registered`);
    }
  };

  // Listen for messages from server
  useEffect(() => {
    socket.on('chat message', (msg) => {
      setChatMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Handle user list updates (if needed)
    socket.on('user list', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('chat message');
      socket.off('user list');
    };
  }, []);

  // Handle message input change
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Send private message
  const sendMessage = () => {
    if (message.trim() && recipient) {
      socket.emit('private message', {
        recipient: recipient,
        message: message
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
              onChange={handleMessageChange}
              placeholder="Type your message"
            />
            <button onClick={sendMessage}>Send</button>
          </div>

          <div>
            <h2>Messages:</h2>
            <ul>
              {chatMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
