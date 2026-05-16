import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Config array moved outside the function
const MODELS_TO_TRY = ["gemini-3-flash-preview", "gemini-1.5-flash"];

const SYSTEM_INSTRUCTIONS = `You are a friendly and supportive Russian language tutor. 
    Analyze the FULL RUSSIAN LINE provided. 
    1. Language of Instruction: Always English.
    2. Target Language: Always Cyrillic (NEVER use Latin transliteration).
    3. MANDATORY: Add stress marks (acute accents U+0301) immediately after the stressed vowel in EVERY multi-syllable Russian word.
    
    Format with Markdown:
    - **Poetic mood**: 1-2 sentences on poetic mood.
    - **Grammar**: Word | Grammar Role | Deep Note.
    - **Notes**: Explain the grammatical 'logic' connecting the words. 
                CRITICAL: Whenever you provide phrase or context examples in the notes, you MUST provide them first in stressed Russian, followed by English in parentheses. 
                Example format: дрёжа от хóлода (shaking from cold) or плáкать от рáдости (crying from joy).`;

export const getDeepAnalysis = async (russianLine, title, artist) => {
  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTIONS
      });

      // We add concrete examples of what we expect to force the model to copy the pattern
      const prompt = `
        You must follow the system instructions perfectly. Here are examples of correct stress mark placement:
        - Example 1: свéтит (mark is after 'е')
        - Example 2: говорúть (mark is after 'и')
        - Example 3: я люблю тебя́ (marks are after 'ю' and 'я')

        Now, analyze this specific song line:
        SONG: "${title}" by ${artist}
        TARGET LINE: "${russianLine}"

       1.  Identify the themes and story of this specific song from your knowledge base.
       2.  Analyze the TARGET LINE specifically within the context of the song's themes. Ensure every single multi-syllable Russian word in your output has its proper stress mark.
       STRICT RULES FOR THE "NOTES" SECTION:
      - Never give an English-only example. 
      - Every grammatical example context must follow the "Russian with stress marks (English translation)" pattern perfectly.
`;


      const result = await model.generateContent(prompt);
      const rawMarkdown = result.response.text();
      return DOMPurify.sanitize(marked.parse(rawMarkdown));

    } catch (err) {
      console.warn(`${modelName} failed:`, err.message);
    }
  }
  return "<p>The teaching assistants are all busy. Please try again in a minute!</p>";
};