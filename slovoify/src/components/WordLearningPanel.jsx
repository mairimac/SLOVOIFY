import React from 'react';
import LogoIcon from './LogoIcon';

const WordLearningPanel = ({ 
  word, 
  translation, 
  usageExample, 
  isOpen, 
  onClose, 
  onSaveFlashcard,
  setActiveTab // Function to switch the UI to the 'flashcards' view
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onSaveFlashcard(); // Triggers the save logic
    setActiveTab('Flashcards'); // Automatically switches the sidebar/view
    onClose(); // Closes this panel
  };

  return (
    <div style={panelOverlayStyle}>
      <div style={panelContentStyle}>
        {/* Header with Logo and Close */}
        <div style={headerStyle}>
          <LogoIcon />
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        <div style={{ marginTop: '30px' }}>
          <span style={labelStyle}>SELECTED WORD</span>
          <h2 style={wordTitleStyle}>{word}</h2>
        </div>

        <div style={infoBoxStyle}>
          <span style={labelStyle}>TRANSLATION</span>
          <p style={translationTextStyle}>{translation}</p>
        </div>

        <div style={infoBoxStyle}>
          <span style={labelStyle}>IN-SONG CONTEXT</span>
          <p style={contextTextStyle}>"{usageExample}"</p>
        </div>

        {/* Action Section */}
        <div style={footerStyle}>
          <button onClick={handleSave} style={saveButtonStyle}>
            Save as Flashcard
          </button>
          <p style={hintStyle}>Saving will add this to your deck and switch your view.</p>
        </div>
      </div>
    </div>
  );
};

// --- Modern 2026 Styles ---

const panelOverlayStyle = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: 3000,
  backdropFilter: 'blur(4px)', // Modern glass effect
};

const panelContentStyle = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: '#181818',
  height: '100%',
  padding: '40px 30px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
  borderLeft: '1px solid #333',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#A7A7A7',
  fontSize: '24px',
  cursor: 'pointer',
};

const labelStyle = {
  fontSize: '0.7rem',
  color: '#1DB954',
  fontWeight: '800',
  letterSpacing: '1.5px',
  display: 'block',
  marginBottom: '8px',
};

const wordTitleStyle = {
  fontSize: '2.5rem',
  margin: 0,
  fontWeight: '800',
  color: '#fff',
};

const infoBoxStyle = {
  marginTop: '40px',
  paddingBottom: '20px',
  borderBottom: '1px solid #282828',
};

const translationTextStyle = {
  fontSize: '1.4rem',
  margin: 0,
  color: '#fff',
};

const contextTextStyle = {
  fontSize: '1rem',
  margin: '10px 0 0 0',
  color: '#A7A7A7',
  fontStyle: 'italic',
};

const footerStyle = {
  marginTop: 'auto',
};

const saveButtonStyle = {
  width: '100%',
  backgroundColor: '#1DB954',
  color: '#000',
  border: 'none',
  padding: '16px',
  borderRadius: '50px', // Spotify-style pill button
  fontWeight: '700',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
};

const hintStyle = {
  textAlign: 'center',
  fontSize: '0.7rem',
  color: '#666',
  marginTop: '12px',
};

export default WordLearningPanel;