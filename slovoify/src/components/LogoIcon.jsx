import React from 'react';

const LogoIcon = () => {
  return (
    <div style={{
      position: 'relative',
      width: '48px',
      height: '48px',
      // Spotify-inspired gradient for depth
      background: 'linear-gradient(135deg, #1DB954 0%, #121212 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      flexShrink: 0 // Prevents the logo from squishing in a flex header
    }}>
      {/* The Musical Note */}
      <span style={{ 
        fontSize: '22px', 
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        userSelect: 'none'
      }}>
        🎵
      </span>

      {/* The "Translation" Bubble Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        backgroundColor: '#FFFFFF',
        color: '#1DB954',
        borderRadius: '5px',
        padding: '2px 4px',
        fontSize: '10px',
        fontWeight: '900',
        lineHeight: '1',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        border: '1.5px solid #121212',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        文
      </div>
    </div>
  );
};

export default LogoIcon;