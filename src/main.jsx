// ============================================================
// main.jsx — Application Entry Point
// ============================================================
// This is the FIRST file React reads when the app starts.
// It finds the <div id="root"> in index.html and "mounts"
// (attaches) the entire React application inside it.
//
// StrictMode: A React development helper that warns you about
// potential problems in your code during development only.
// It renders components twice to detect side-effects.
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
