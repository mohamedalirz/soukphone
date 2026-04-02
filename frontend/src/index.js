// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Clean up any corrupted token on app start
const token = localStorage.getItem("token");
if (token === "[object Object]" || token === "undefined") {
  console.log("Cleaning up corrupted token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);