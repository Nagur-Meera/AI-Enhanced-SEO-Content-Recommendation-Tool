import React from 'react';
import './Loading.css';

const Loading = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className="spinner spinner-sm"></div>
      <span className="loading-text">{text}</span>
    </div>
  );
};

export default Loading;
