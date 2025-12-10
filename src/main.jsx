import React from 'react';
import ReactDOM from 'react-dom/client';
import EcomPKStore from './App.jsx'; // Assuming you named your main file EcomPKStore.jsx
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EcomPKStore />
  </React.StrictMode>,
);