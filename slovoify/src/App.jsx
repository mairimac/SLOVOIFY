import { useEffect, useState, useCallback } from "react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

import "./App.css";
import TrackMeta from "./components/TrackMeta";
import LyricsPanel from "./components/LyricsPanel";
import WordLearningPanel from "./components/WordLearningPanel";
import FlashcardDeck from "./components/FlashcardDeck";
import LogoIcon from './components/LogoIcon';
import { getDeepAnalysis } from "./teacherService";

// Update these to match your Dashboard
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "http://127.0.0.1:5173/";

const sdk = SpotifyApi.withUserAuthorization(CLIENT_ID, REDIRECT_URI, [
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
]);

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [lyricsLines, setLyricsLines] = useState([]);
  const [lyricsStatus, setLyricsStatus] = useState("idle");
  const [activeTranslation, setActiveTranslation] = useState("");
  const [lineTranslation, setLineTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [selectedLineContext, setSelectedLineContext] = useState("");
  const [wordInfo, setWordInfo] = useState(null);
  const [isWordInfoLoading, setIsWordInfoLoading] = useState(false);
  const [wordInfoError, setWordInfoError] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Lyrics");
  const [translatedLineRussian, setTranslatedLineRussian] = useState("");
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveWord, setDeepDiveWord] = useState("");
  const [deepDiveHtml, setDeepDiveHtml] = useState("");
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);

  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem("slovoify_cards");
    return saved ? JSON.parse(saved) : [];
  });
  

  useEffect(() => {
    localStorage.setItem("slovoify_cards", JSON.stringify(flashcards));
  }, [flashcards]);

  const saveFlashcard = async (word, contextLine) => {
    const cleanWord = word.replace(/[^\p{L}']/gu, "").trim();

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=ru|en`);
      const data = await res.json();
      const translation = data.responseData?.translatedText || cleanWord;

      const phraseUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=auto|en`;
      const phraseRes = await fetch(phraseUrl);
      const phraseData = await phraseRes.json();

      const newExampleRU = phraseData.matches[1]?.segment || `Here is an example with ${cleanWord}`;
      const newExampleEN = phraseData.matches[1]?.translation || `I love this word: ${translation}`;

      const newCard = {
        id: Date.now(),
        word: cleanWord,
        translation,
        lyricContext: contextLine,
        newExampleRU,
        newExampleEN,
        revealed: false,
      };

      setFlashcards((cards) => [...cards, newCard]);
    } catch (err) {
      console.error("Flashcard Error:", err);
    }
  };

  const getRussianLyrics = useCallback(async (artist, title) => {
    const cleanTitle = title
      .replace(/\(.*\)/g, '')
      .replace(/ - .*/g, '')
      .replace(/\[.*\]/g, '')
      .trim();

    const cleanArtist = artist.split(',')[0].trim();

    setLineTranslation("");
    setLyricsStatus("loading");
    try {
      const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
      const response = await fetch(url);
      const data = await response.json();
      const rawLyrics = data.plainLyrics ; "";
      setLyricsLines(
        rawLyrics.split("\n").map((line, index) => ({
          id: `${index}-${line.slice(0, 20)}`,
          text: line,
          hasRussian: /[а-яА-ЯёЁ]/.test(line),
        }))
      );
      setLyricsStatus(rawLyrics ? "loaded" : "empty");
    } catch (error) {
      console.error("LRCLIB Error:", error);
      setLyricsLines([]);
      setLyricsStatus("error");
    }
  }, []);

  const getTranslation = async (text, isLineTranslation = false) => {
    if (!text || text.trim().length === 0) return;
    setIsTranslating(true);
    setTranslatedLineRussian(text);

    if (isLineTranslation) {
      setLineTranslation("");
      setDeepDiveHtml("");
      setDeepDiveWord(text);
      setShowDeepDive(false);
    }

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|en`);
      const data = await res.json();
      const output = data.responseData?.translatedText || "Translation glitch. Try that line again?";

      if (isLineTranslation) {
        setLineTranslation(output);
        setActiveTranslation("");
      } else {
        setActiveTranslation(output);
      }
    } catch (err) {
      if (isLineTranslation) {
        setLineTranslation("Translation error.");
      } else {
        setActiveTranslation("Translation error.");
      }
      console.error("Translation Error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const openDeepDive = async (text) => {
    if (!text) return;
    setDeepDiveWord(text);
    setShowDeepDive(true);
    setIsDeepDiveLoading(true);
    setDeepDiveHtml("");

    try {
      const lineAnalysisHtml = await getDeepAnalysis(
        text,
        currentTrack?.name || "Unknown Song",
        currentTrack?.artists?.[0]?.name || "Unknown Artist"
      );
      setDeepDiveHtml(lineAnalysisHtml);
    } catch (err) {
      console.error("Deep Dive Error:", err);
      setDeepDiveHtml("<p>Could not load analysis. Try again later.</p>");
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  const cleanWordForLookup = (word) => word.replace(/[^\p{L}']/gu, "").trim();

  const fetchWordInfo = useCallback(async (word) => {
    if (!word) return;
    setIsWordInfoLoading(true);
    setSelectedWord(word);
    setWordInfo(null);
    setWordInfoError("");

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=ru|en`);
      const data = await res.json();
      const translation = data.responseData?.translatedText || word;

      setWordInfo({ translation, grammar: "Translation only", partOfSpeech: "", lemma: word });
    } catch (err) {
      console.error("Word Info Error:", err);
      setWordInfoError("Could not fetch word information. " + err.message);
    } finally {
      setIsWordInfoLoading(false);
    }
  }, []);

  const handleWordClick = (word, line) => {
    const cleanWord = cleanWordForLookup(word);
    if (!cleanWord) return;
    setLineTranslation("");
    setSelectedLineContext(line);
    setSelectedWord(cleanWord);
    setIsPanelOpen(true); // Open the panel immediately
    
    getTranslation(cleanWord);
    fetchWordInfo(cleanWord);
  };

  const closeWordPanel = () => {
    setSelectedWord("");
    setWordInfo(null);
    setWordInfoError("");
    setSelectedLineContext("");
    setIsPanelOpen(false);
    setActiveTranslation("");
  };

  const clearTranslation = () => {
    setActiveTranslation("");
  };
const handleSaveAndSwitch = async () => {
    await saveFlashcard(selectedWord, selectedLineContext);
    setActiveTab("Flashcards"); // Switch the tab
    setIsPanelOpen(false);      // Close the panel
  }
  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const playback = await sdk.player.getCurrentlyPlayingTrack();
        if (playback && playback.item) {
          const newTrack = playback.item;
          setCurrentTrack((prevTrack) => {
            if (prevTrack?.id !== newTrack.id) {
              getRussianLyrics(newTrack.artists[0].name, newTrack.name);
              return newTrack;
            }
            return prevTrack;
          });
        }
      } catch (err) {
        console.error("Spotify Fetch Error:", err);
      }
    };

    fetchTrack();
    const interval = setInterval(fetchTrack, 5000);
    return () => clearInterval(interval);
  }, [getRussianLyrics]);

  
 return (
    <div style={{ backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <header style={{ 
        padding: '25px 40px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '18px' 
      }}>
        <LogoIcon />
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.8rem', 
            fontWeight: '800', 
            letterSpacing: '-0.5px' 
          }}>
            SONG <span style={{ color: '#1DB954' }}>CIPHER</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5, letterSpacing: '1px' }}>
            DECODE THE MELODY
          </p>
        </div>
      </header>

        {!currentTrack ? (
          <p className="status-msg">Play a song on Spotify to start learning!</p>
        ) : (
          <main>
            <TrackMeta currentTrack={currentTrack} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              <div className="tab-controls">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("Lyrics");
                    setShowDeepDive(false);
                  }}
                  className={`tab-button ${activeTab === "Lyrics" ? "active" : ""}`}
                >
                  Lyrics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("Flashcards");
                    setShowDeepDive(false);
                  }}
                  className={`tab-button ${activeTab === "Flashcards" ? "active" : ""}`}
                >
                  Flashcards
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "Lyrics" && (
                  <div className="lyrics-panel">
                    <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Lyrics</h2>
                    <LyricsPanel
                      lyricsStatus={lyricsStatus}
                      lyricsLines={lyricsLines}
                      getTranslation={getTranslation}
                      handleWordClick={handleWordClick}
                      cleanWordForLookup={cleanWordForLookup}
                      selectedWord={selectedWord}
                    />
                  </div>
                )}

                {activeTab === "Flashcards" && (
                  <div className="flashcard-panel">
                    <FlashcardDeck flashcards={flashcards} setFlashcards={setFlashcards} />
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {lineTranslation && activeTab === "Lyrics" && (
          <div style={{
            position: 'fixed',
            right: 0, top: 0,
            width: '400px',
            height: '100vh',
            backgroundColor: '#181818',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            padding: '40px 20px',
            zIndex: 2999,
            borderLeft: '1px solid #333',
            animation: 'slideIn 0.3s ease-out',
            overflowY: 'scroll'
          }}>
            <button onClick={() => setLineTranslation("")} style={{ background: 'none', border: 'none', color: '#1DB954', cursor: 'pointer', fontSize: '0.9rem' }}>← BACK</button>
            <p style={{ margin: '16px 0 8px', fontSize: '0.85rem', color: '#1DB954', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Line translation
            </p>
            <p style={{ margin: '0 0 8px 0', color: '#A7A7A7', fontSize: '0.95rem' }}>
              {translatedLineRussian}
            </p>
            <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', lineHeight: '1.6', color: '#fff' }}>
              {lineTranslation}
            </p>
            {!showDeepDive && (
              <button
                type="button"
                onClick={() => openDeepDive(deepDiveWord)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  backgroundColor: '#1DB954',
                  border: 'none',
                  borderRadius: '999px',
                  color: '#121212',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Deep dive into this line
              </button>
            )}
          </div>
        )}

        {isPanelOpen && (
          <WordLearningPanel
            isOpen={isPanelOpen}
            onClose={closeWordPanel}
            word={selectedWord}
            translation={activeTranslation || (isTranslating ? "Translating..." : "")}
            usageExample={selectedLineContext}
            onSaveFlashcard={handleSaveAndSwitch}
            setActiveTab={setActiveTab}
          />
        )}
        
        {showDeepDive && activeTab === "Lyrics" && (
          <div style={{
            position: 'fixed',
            right: 0, top: 0,
            width: '400px',
            height: '100vh',
            backgroundColor: '#181818',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            padding: '40px 20px',
            zIndex: 3000,
            borderLeft: '1px solid #1DB954',
            animation: 'slideIn 0.3s ease-out',
            overflowY: 'scroll'
          }}>
            <button onClick={() => setShowDeepDive(false)} style={{ background: 'none', border: 'none', color: '#1DB954', cursor: 'pointer' }}>← BACK</button>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{deepDiveWord}</h1>
            {isDeepDiveLoading ? (
              <p style={{ color: '#1DB954' }}>Teacher is analyzing the grammar... ✍️</p>
            ) : (
              <div 
                className="ai-content-wrapper"
                dangerouslySetInnerHTML={{ __html: deepDiveHtml }} 
                style={{ fontSize: '0.95rem', lineHeight: '1.6', wordWrap: 'break-word' }}
              />
            )}
          </div>
        )}
      </div>
    
  );
}

export default App;
