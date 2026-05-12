import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Use the preview model you mentioned
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_INSTRUCTIONS = `You are a supportive Russian language tutor. 
    Analyze the FULL RUSSIAN LINE provided. 
    1. Language of Instruction: Always English.
    2. Target Language: Always Cyrillic (NEVER use Latin transliteration).
    3. Mandatory: Add stress marks (acute accents) to all Russian words.
    
    Format with Markdown:
    - **Poetic mood**: 1-2 sentences on poetic mood.
    - **Grammar**: Word | Grammar Role | Deep Note.
    - **Notes**: Explain the grammatical 'logic' connecting the words.`;

export const getDeepAnalysis = async (russianLine, title, artist) => {
  // List of models to try in order of preference
  const modelsToTry = ["gemini-3-flash-preview", "gemini-1.5-flash"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting analysis with ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTIONS
      });

      const prompt = `
    SONG: "${title}" by ${artist}
    TARGET LINE: "${russianLine}"

    INSTRUCTION: 
    1. Identify the themes and story of this specific song from your knowledge base.
    2. Analyze the TARGET LINE specifically within the context of those themes.
STRICT STRESS MARK RULES:
1. Every multi-syllable Russian word must have exactly one stress mark.
2. The stress mark (unicode U+0301) MUST be placed IMMEDIATELY AFTER the stressed vowel.
   - Example Correct: свéтит (mark is after 'е')
   - Example Incorrect: с́ветит (mark is after 'с')
3. Vowels are: а, е, ё, и, о, у, ы, э, ю, я.
    4. Explain in English.
  `;

      const result = await model.generateContent(prompt);
      const rawMarkdown = result.response.text();

      return DOMPurify.sanitize(marked.parse(rawMarkdown));

    } catch (err) {
      // If it's a 503 or overload error, we loop to the next model
      console.warn(`${modelName} failed or is busy:`, err.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        // If the last model in our list also fails, throw the error
        return "<p>The teaching assistants are all busy. Please try again in a minute!</p>";
      }
    }
  }
};