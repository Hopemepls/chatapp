import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://chatapp-server61.onrender.com');  // Изменено на URL Render-сервера

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');  // Новое состояние для имени пользователя

  useEffect(() => {
    fetch('https://chatapp-server61.onrender.com/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error('Ошибка получения сообщений:', data);
        }
      })
      .catch(err => console.error('Ошибка fetch:', err));

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === '' || username.trim() === '') return;  // Проверка, чтобы имя и сообщение не были пустыми
    socket.emit('sendMessage', { username: username.trim(), text: input.trim() });
    setInput('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Чат</h1>
      
      {/* Поле ввода имени */}
      <div style={{ marginBottom: '10px' }}>
        <label>Ваше имя: </label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Введите ваше имя"
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </div>
      
      {/* Список сообщений */}
      <div style={{ listStyle: 'none', padding: 0, margin: 0, height: '600px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map(msg => {
          const isCurrentUser = msg.username === username; // Проверяем, сообщение от текущего пользователя
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start', // Выравнивание: справа для ваших, слева для чужих
                marginBottom: '10px'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: isCurrentUser ? '#007bff' : '#f1f1f1', // Синий для ваших, серый для чужих
                  color: isCurrentUser ? 'white' : 'black',
                  wordWrap: 'break-word'
                }}
              >
                <div>{msg.username}:</div> 
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Поле ввода сообщения и кнопка */}
      <div style={{ marginTop: '10px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Введите сообщение"
          style={{ padding: '5px', width: '70%', marginRight: '10px' }}
        />
        <button onClick={sendMessage} style={{ padding: '5px 10px' }}>Отправить</button>
      </div>
    </div>
  );
}

export default App;
