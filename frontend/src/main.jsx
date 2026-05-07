import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const container = document.getElementById('root');

if (!container) {
  console.error("Failed to find the root element. Please make sure there is a <div id=\"root\"></div> in your index.html.");
} else {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

