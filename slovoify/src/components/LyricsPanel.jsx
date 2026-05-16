export default function LyricsPanel({ lyricsStatus, lyricsLines, getTranslation, handleWordClick, cleanWordForLookup, selectedWord }) {
  return (
    <section className="lyrics-container">
      {(lyricsStatus === "loading" || lyricsStatus === "idle") && (
        <p className="status-msg">Loading lyrics...</p>
      )}
      {lyricsStatus === "error" && (
        <p className="status-msg">Lyrics not available for this track, try another song! </p>
      )}
      {lyricsStatus === "empty" && (
        <p className="status-msg">No lyrics found for this track.</p>
      )}

      {lyricsStatus === "loaded" && lyricsLines.map((line) => {
        const isLineEmpty = line.text.trim().length === 0;
        return (
          <div key={line.id} className="lyric-line">
            {!isLineEmpty && (
              <div className="line-actions">
                <button
                  className="line-button translate-button"
                  onClick={() => getTranslation(line.text, true)}
                  aria-label="Translate this line"
                >TRANSLATE
                </button>
              </div>
            )}

            <p className="line-text">
              {line.text.split(" ").map((word, index) => {
                const cleanWord = cleanWordForLookup(word);
                const isTranslatable = cleanWord.length > 2;
                const isSelected = cleanWord === selectedWord;

                return (
                  <span
                    key={`${index}-${word}`}
                    onClick={() => isTranslatable && handleWordClick(word, line.text)}
                    className={`word-chip ${isTranslatable ? "translatable" : ""} ${isSelected ? "selected" : ""}`}
                    style={{
                      color: isTranslatable ? '#1DB954' : '#ccc',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </p>
          </div>
        );
      })}
    </section>
  );
}
