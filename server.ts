import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache for synthesized audio to ensure instant replay
const audioCache = new Map<string, string>();

// Predefined available voices for Biblical Hebrew
export const HEBREW_RECITATION_VOICES = [
  {
    id: 'Fenrir',
    name: '펜리르 (장엄한 제사장 음성)',
    gender: 'male',
    description: '토라 독송과 칸토르 낭독에 적합한 깊고 장엄한 원어 음성',
  },
  {
    id: 'Zephyr',
    name: '제피르 (차분하고 경건한 음성)',
    gender: 'neutral',
    description: '경건한 묵상과 반복 암송에 집중할 수 있는 부드러운 음조',
  },
  {
    id: 'Kore',
    name: '코레 (맑고 또렷한 낭독 음성)',
    gender: 'female',
    description: '모음(니쿠드)과 자음이 명확하게 구분되는 선명한 발음',
  },
  {
    id: 'Charon',
    name: '카론 (중후한 고대 독송 음성)',
    gender: 'male',
    description: '고대 회당의 무게감 있는 성경 독송 스타일',
  },
  {
    id: 'Puck',
    name: '퍽 (경쾌한 학습용 음성)',
    gender: 'male',
    description: '단어별 빠른 확인 및 반복 암기에 적합한 템포',
  },
];

// Endpoint: Return voice options
app.get('/api/tts/voices', (_req, res) => {
  res.json({ voices: HEBREW_RECITATION_VOICES });
});

// Endpoint: Check health & TTS service readiness
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    ttsReady: Boolean(process.env.GEMINI_API_KEY),
    cachedCount: audioCache.size,
  });
});

// Endpoint: Synthesize Biblical Hebrew Speech via Gemini 3.8 Flash Lite TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Fenrir' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text string is required' });
    }

    const cleanText = text.trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    const cacheKey = `${voice}:::${cleanText}`;

    // Check server memory cache
    if (audioCache.has(cacheKey)) {
      return res.json({
        audio: audioCache.get(cacheKey),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on server',
      });
    }

    // Call Gemini 3.8 Flash Lite TTS with speech style instruction for Biblical Hebrew
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, sacred Biblical Hebrew chanting and recitation, articulated accurately with niqqud vowels and reverent cadence',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({
        error: 'No audio data returned by synthesis model',
      });
    }

    // Cache successful audio result
    audioCache.set(cacheKey, base64Audio);

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
      cached: false,
    });
  } catch (error: any) {
    console.error('Error generating Hebrew recitation TTS:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize Hebrew recitation',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Torah Hebrew Memory Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
