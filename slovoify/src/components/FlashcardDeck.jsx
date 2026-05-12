import { useState } from 'react';






export default function FlashcardDeck({ flashcards, setFlashcards }) {
  const toggleReveal = (id) => {
    setFlashcards((cards) => cards.map((card) => card.id === id ? { ...card, revealed: !card.revealed } : card));
  };

  const removeCard = (id) => {
    setFlashcards((cards) => cards.filter((card) => card.id !== id));
  };

  return (
    <section className="flashcard-section">
      <h2>Your Flashcard Deck ({flashcards.length})</h2>
      <div className="flashcard-grid">
        {flashcards.map((card) => (
          <article key={card.id} className="flashcard-card">
            <div>
              <h2 className="flashcard-card__title">{card.word}</h2>
              <div className="flashcard-card__content">
                <div className="flashcard-card__context">
                  <p className="flashcard-card__label">NEW CONTEXT:</p>
                  <p>{card.newExampleRU}</p>
                  {card.revealed && <p className="flashcard-card__revealed">{card.newExampleEN}</p>}
                </div>

                {card.revealed && (
                  <div className="flashcard-card__details">
                    <p className="flashcard-card__label">ORIGINAL SONG LYRIC:</p>
                    <p className="flashcard-card__lyric">"{card.lyricContext}"</p>
                    <p className="flashcard-card__meaning">Meaning: {card.translation}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flashcard-card__actions">
              <button
                onClick={() => toggleReveal(card.id)}
                className="flashcard-card__button flashcard-card__button--primary"
              >
                {card.revealed ? "Hide Details" : "Reveal Meaning & Song"}
              </button>
              <button
                onClick={() => removeCard(card.id)}
                className="flashcard-card__button flashcard-card__button--danger"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
