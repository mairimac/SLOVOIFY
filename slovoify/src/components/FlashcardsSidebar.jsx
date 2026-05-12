export default function FlashcardsSidebar({ flashcards, setFlashcards }) {
  const toggleReveal = (id) => {
    setFlashcards((cards) => cards.map((card) => card.id === id ? { ...card, revealed: !card.revealed } : card));
  };

  const removeCard = (id) => {
    setFlashcards((cards) => cards.filter((card) => card.id !== id));
  };

  return (
    <div style={{ 
      flex: '1', 
      maxWidth: '400px', 
      position: 'sticky', 
      top: '20px', 
      maxHeight: '90vh',
      overflowY: 'auto', 
      paddingRight: '10px'
    }}>
      <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Flashcards ({flashcards.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {flashcards.length === 0 ? (
          <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Your deck is empty. Click a word to create a card.</p>
        ) : (
          flashcards.map((card) => (
            <div 
              key={card.id}
              style={{ 
                background: '#282828', 
                border: '2px solid #1db954',
                padding: '20px', 
                borderRadius: '15px',
                color: 'white'
              }}
            >
              <h2 style={{ color: '#1db954', margin: '0 0 10px 0' }}>{card.word}</h2>
              <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 5px 0' }}>NEW CONTEXT:</p>
                <p style={{ fontSize: '1rem', margin: 0 }}>{card.newExampleRU}</p>
                {card.revealed && <p style={{ fontSize: '0.9rem', color: '#1db954', marginTop: '5px' }}>{card.newExampleEN}</p>}
              </div>

              {card.revealed && (
                <div style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
                  <p style={{ fontSize: '0.7rem', color: '#888' }}>ORIGINAL SONG LYRIC:</p>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>&quot;{card.lyricContext}&quot;</p>
                  <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Meaning: {card.translation}</p>
                </div>
              )}

              <button 
                onClick={() => toggleReveal(card.id)}
                style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '5px', background: '#1db954', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {card.revealed ? "Hide Details" : "Reveal Meaning & Song"}
              </button>
              <button
                onClick={() => removeCard(card.id)}
                style={{ width: '100%', marginTop: '5px', padding: '5px', borderRadius: '5px', background: '#ff4444', border: 'none', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
