import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MODELS_TO_TRY = ["gemini-3-flash-preview", "gemini-1.5-flash"];

const LANGUAGE_PROFILES = {
  russian: {
    name: "Russian",
    instructions: `You are a supportive and friendly Russian language tutor. 
    Analyze the FULL RUSSIAN LINE provided in the context of the song's themes and story.
    1. Language of Instruction: Always English.
    2. Target Language: Always Cyrillic (NEVER use Latin transliteration).
    3. MANDATORY: Add stress marks (acute accents U+0301) immediately after the stressed vowel in EVERY multi-syllable Russian word.
    
    Format with Markdown:
    - **Poetic mood**: 1-2 sentences on poetic mood of the line, connecting it to the song's themes.
    - **Grammar**: Word | Grammar Role | Deep Note.
    - **Notes**: Explain the grammatical 'logic' connecting the words. 
                CRITICAL: Whenever you provide phrase or context examples in the notes, you MUST provide them first in stressed Russian, followed by English in parentheses.`,
    examples: `
      - Example 1: свéтит (mark is after 'е')
      - Example 2: говорúть (mark is after 'и')
      - Example 3: я люблю тебя́ (marks are after 'ю' and 'я')
    `
  },
  gaelic: {
    name: "Scottish Gaelic",
    instructions: `You are a supportive Scottish Gaelic language tutor. 
    Analyze the FULL GAELIC LINE provided. 
    1. Language of Instruction: Always English.
    2. Target Language: Always Scottish Gaelic (ensure accurate usage of grave accents: à, è, ì, ò, ù). NEVER use Cyrillic or Russian characters.
    
    Format with Markdown:
    - **Poetic mood**: 1-2 sentences on the poetic vibe of the line.
    - **Grammar**: Word | Grammar Role | Deep Note (e.g., explaining prepositional pronouns, lenition, or slenderization).
    - **Notes**: Explain the idiomatic 'logic' connecting the words.
                CRITICAL: Whenever you provide phrase or context examples in the notes, you MUST provide them first in accurate Scottish Gaelic text, followed by English in parentheses.`,
    examples: `
      - Example 1: Tàthadh (Prepositional logic)
      - Example 2: Tha mi a' seinn (Continuous aspect breakdown)
    `
  }
  ,
  polish: {
    name: "Polish",
    instructions: `You are a supportive Polish language tutor.
    Analyze the FULL POLISH LINE provided.
    1. Language of Instruction: Always English.
    2. Target Language: Always Polish (use correct Polish diacritics: ą, ć, ę, ł, ń, ó, ś, ź, ż).

    Format with Markdown:
    - **Poetic mood**: 1-2 sentences on the poetic mood.
    - **Grammar**: Word | Grammar Role | Deep Note (e.g., cases, aspect, verb conjugation).
    - **Notes**: Explain morphological and syntactic connections.
                CRITICAL: Whenever you provide phrase or context examples in the notes, provide them first in Polish, followed by English in parentheses.`,
    examples: `
      - Example 1: żółć (diacritic example)
      - Example 2: kocham cię (present tense example)
    `
  },
  lithuanian: {
    name: "Lithuanian",
    instructions: `You are a supportive Lithuanian language tutor.
    Analyze the FULL LITHUANIAN LINE provided.
    1. Language of Instruction: Always English.
    2. Target Language: Always Lithuanian (use correct Lithuanian diacritics: ą, č, ę, ė, į, š, ų, ū, ž).

    Format with Markdown:
    - **Poetic mood**: 1-2 sentences on the poetic mood.
    - **Grammar**: Word | Grammar Role | Deep Note (e.g., case endings, verb aspects).
    - **Notes**: Explain morphology and idiomatic usage.
                CRITICAL: Whenever you provide phrase or context examples in the notes, provide them first in Lithuanian, followed by English in parentheses.`,
    examples: `
      - Example 1: žemė (earth example)
      - Example 2: aš myliu tave (I love you example)
    `
  },
  ukrainian: {
    name: "Ukrainian",
    instructions: `You are a supportive Ukrainian language tutor. 
    Analyze the FULL UKRAINIAN LINE provided. 
    1. Language of Instruction: Always English.
    2. Target Language: Always native Ukrainian Cyrillic text (ensure accurate use of unique Ukrainian letters like і, ї, є, ґ). NEVER use Latin transliteration.
    3. MANDATORY: Add stress marks (acute accents U+0301) immediately after the stressed vowel in EVERY multi-syllable Ukrainian word to assist with pronunciation.
    
    Format with Markdown:
    - **Poetic mood**: 1-2 sentences on the poetic context of the line.
    - **Grammar**: Word | Grammar Role | Deep Note (e.g., explaining noun cases, verb conjugations, or aspects).
    - **Notes**: Explain the idiomatic 'logic' connecting the words.
                CRITICAL: Whenever you provide phrase or context examples in the notes, you MUST provide them first in stressed Ukrainian Cyrillic, followed by English in parentheses.`,
    examples: `
      - Example 1: говору́ (mark is after 'у')
      - Example 2: співа́ти (mark is after 'а')
      - Example 3: я тебе́ коха́ю (marks are after 'е' and 'а')
    `
  }
};

export const getDeepAnalysis = async (line, title, artist, language = 'auto') => {
  // Auto-detect language: prefer Russian if any Cyrillic present, otherwise Gaelic
  let detected = language;
  if (language === 'auto') {
    if (/[а-яА-ЯёЁ]/.test(line)) detected = 'russian';
    else if (/[ąćęłńóśżźĄĆĘŁŃÓŚŻŹ]/.test(line)) detected = 'polish';
    else if (/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/.test(line)) detected = 'lithuanian';
    else if (/[àèìòùÀÈÌÒÙ]/.test(line)) detected = 'gaelic';
    else detected = 'gaelic';
  }

  const profile = LANGUAGE_PROFILES[detected] || LANGUAGE_PROFILES.russian;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Attempting analysis with ${modelName} using profile: ${profile.name}...`);
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: profile.instructions
      });

      const prompt = `
        You must follow the system instructions perfectly. Here are examples of correct formatting and character placement for this language:
        ${profile.examples}

        Now, analyze this specific song line:
        SONG: "${title}" by ${artist}
        TARGET LINE: "${line}"

        1. Identify the themes and story of this specific song from your knowledge base.
        2. Analyze the TARGET LINE specifically within the context of the song's themes.
        
        STRICT RULES FOR THE "NOTES" SECTION:
        - Never give an English-only example. 
        - Every grammatical example context must follow the "${profile.name} (English translation)" pattern perfectly.
      `;

      const result = await model.generateContent(prompt);

      // Robustly extract text from different possible response shapes
      let rawMarkdown = "";
      try {
        if (!result) rawMarkdown = "";
        else if (typeof result === 'string') rawMarkdown = result;
        else if (result.response) {
          // some SDKs provide response.text() or response as string
          rawMarkdown = typeof result.response.text === 'function'
            ? await result.response.text()
            : String(result.response.text || result.response || '');
        } else if (result.candidates?.[0]?.content) {
          // another common shape: candidates -> content -> text
          const cand = result.candidates[0];
          rawMarkdown = cand.content?.text || JSON.stringify(cand.content) || '';
        } else if (result.output?.[0]?.content?.text) {
          rawMarkdown = result.output[0].content.text;
        } else {
          rawMarkdown = JSON.stringify(result);
        }
      } catch (e) {
        console.warn('Failed to normalize model output:', e);
        rawMarkdown = String(result || '');
      }

      // If the model returned an empty object, provide a helpful fallback
      if (!rawMarkdown || rawMarkdown.trim().length === 0) {
        rawMarkdown = `**No analysis available.** The model returned no text.`;
      }

      return DOMPurify.sanitize(marked.parse(rawMarkdown));

    } catch (err) {
      console.warn(`${modelName} failed or is busy:`, err?.message || err);
    }
  }
  // If configured models failed, try listing available models and retrying with a supported one
  try {
    let listed = [];
    if (typeof genAI.listModels === 'function') {
      listed = await genAI.listModels();
    } else if (typeof genAI.getModels === 'function') {
      listed = await genAI.getModels();
    }

    // Normalize list to array of names
    let modelNames = [];
    if (Array.isArray(listed)) modelNames = listed.map(m => m.name || m.model || m.id).filter(Boolean);
    else if (listed && Array.isArray(listed.models)) modelNames = listed.models.map(m => m.name || m.id).filter(Boolean);

    // Filter for Gemini-like models as a last-resort heuristic
    modelNames = modelNames.filter(n => /gemini|alpha|beta|text|chat/i.test(n));

    for (const mName of modelNames) {
      try {
        console.log(`Retrying analysis with discovered model ${mName}...`);
        const model = genAI.getGenerativeModel({ model: mName, systemInstruction: profile.instructions });
        const prompt = `
          You must follow the system instructions perfectly. Here are examples of correct formatting and character placement for this language:
          ${profile.examples}

          Now, analyze this specific song line:
          SONG: "${title}" by ${artist}
          TARGET LINE: "${line}"

          1. Identify the themes and story of this specific song from your knowledge base.
          2. Analyze the TARGET LINE specifically within the context of the song's themes.
        `;

        const result = await model.generateContent(prompt);
        let rawMarkdown = "";
        try {
          if (!result) rawMarkdown = "";
          else if (typeof result === 'string') rawMarkdown = result;
          else if (result.response) {
            rawMarkdown = typeof result.response.text === 'function'
              ? await result.response.text()
              : String(result.response.text || result.response || '');
          } else if (result.candidates?.[0]?.content) {
            const cand = result.candidates[0];
            rawMarkdown = cand.content?.text || JSON.stringify(cand.content) || '';
          } else if (result.output?.[0]?.content?.text) {
            rawMarkdown = result.output[0].content.text;
          } else {
            rawMarkdown = JSON.stringify(result);
          }
        } catch (e) {
          rawMarkdown = String(result || '');
        }

        if (!rawMarkdown || rawMarkdown.trim().length === 0) rawMarkdown = `**No analysis available.** The model returned no text.`;
        return DOMPurify.sanitize(marked.parse(rawMarkdown));
      } catch (e) {
        console.warn(`Discovered model ${mName} failed:`, e?.message || e);
        continue;
      }
    }
  } catch (listErr) {
    console.warn('Could not list models from API:', listErr?.message || listErr);
  }

  return "<p>The teaching assistants are all busy or the requested model is unsupported. Please try again in a minute!</p>";
};