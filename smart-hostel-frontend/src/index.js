import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';

// Global interceptor to redirect all localhost:2008 requests to the production backend
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:2008')) {
    config.url = config.url.replace('http://localhost:2008', 'https://smart-hostel-api-rm6j.onrender.com');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
