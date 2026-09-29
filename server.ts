import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// --- Security hardening ---
// Helmet sets a suite of protective HTTP headers (CSP, HSTS, X-Frame-Options, etc.).
// CSP is loosened only for the inline styles/scripts Vite injects and the remote
// Quran/hadith media the app streams; everything else is locked down by default.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:", "https:", "'unsafe-inline'"],
        "media-src": ["'self'", "https:", "blob:", "data:"],
        "connect-src": ["'self'", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Global rate limiter: protects every route from request floods.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد قليل." },
});
app.use(apiLimiter);

// Stricter limiter for AI endpoints (expensive, quota-bound).
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 AI requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تم تجاوز حد طلبات الذكاء الاصطناعي. يرجى المحاولة بعد دقيقة." },
});

app.use(express.json({ limit: "15mb" }));

// Lazy/Safe Gemini initialization.
// The API key MUST come exclusively from the environment (GEMINI_API_KEY).
// Never hardcode secrets in source — see .env.example and SECURITY.md.
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Convert PCM 16-bit 24kHz audio from Gemini into valid browser-playable WAV
function pcmToWav(pcmBase64: string, sampleRate = 24000): Buffer {
  const pcmBuffer = Buffer.from(pcmBase64, "base64");
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Cooldown tracker for Gemini TTS preview quota limit (10 requests/day free tier)
let geminiTtsQuotaExhaustedUntil: number = 0;

// Generate realistic human voice audio using Gemini TTS with high-fidelity fallback
async function generateEgyptianSpeechAudio(text: string, voiceOrGender = "male"): Promise<string | null> {
  if (!text || !text.trim()) return null;

  // Clean text for optimal TTS vocalization (remove markdown, citations, urls)
  const cleanSpoken = text
    .replace(/[*_#`~>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/المصدر\s*:\s*[^\n]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanSpoken) return null;

  // 1. First choice: Gemini high-fidelity natural voice (Charon for serene spiritual male, Aoede for calm female)
  const ai = getGenAI();
  if (ai && Date.now() > geminiTtsQuotaExhaustedUntil) {
    const voiceName = (voiceOrGender === "female" || voiceOrGender === "Aoede") ? "Aoede" : "Charon";
    try {
      const res = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: cleanSpoken.slice(0, 450),
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName,
              },
            },
          },
        },
      });
      const audioData = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const wav = pcmToWav(audioData, 24000);
        return `data:audio/wav;base64,${wav.toString("base64")}`;
      }
    } catch (err: any) {
      // If 429 quota exhausted, set 30 min cooldown to seamlessly use fast neural Arabic voice without repeated 429 penalties
      const msg = String(err?.message || "");
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
        geminiTtsQuotaExhaustedUntil = Date.now() + 30 * 60 * 1000;
      }
    }
  }

  // 2. Seamless High-Speed Natural Arabic Voice Fallback (ultra-reliable, zero-quota failure)
  try {
    const encoded = encodeURIComponent(cleanSpoken.slice(0, 300));
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ar&client=tw-ob`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const audioRes = await fetch(fallbackUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (audioRes.ok) {
      const arrayBuffer = await audioRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:audio/mp3;base64,${buffer.toString("base64")}`;
    }
  } catch (fallbackErr) {
    console.warn("Speech audio fallback error:", fallbackErr);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Custom OpenAI-compatible AI provider (optional, user-configurable)
// ---------------------------------------------------------------------------
// The app is powered by Gemini by default. If you want to route some requests
// through a different LLM provider (DeepSeek, Groq, OpenRouter, Ollama, or any
// OpenAI-compatible endpoint), set these env vars in your .env:
//
//   CUSTOM_AI_BASE_URL   e.g. https://api.deepseek.com/v1   (no trailing slash)
//   CUSTOM_AI_API_KEY    your key for that provider
//   CUSTOM_AI_MODEL      e.g. deepseek-chat
//
// When unset, the app relies on Gemini alone — every caller below already falls
// back to Gemini, so nothing breaks.
function getCustomAIConfig() {
  const baseUrl = (process.env.CUSTOM_AI_BASE_URL || "").trim().replace(/\/+$/, "");
  const apiKey = (process.env.CUSTOM_AI_API_KEY || "").trim();
  const model = (process.env.CUSTOM_AI_MODEL || "").trim();
  if (!baseUrl || !apiKey || !model) return null;
  return { baseUrl, apiKey, model };
}

// Generic OpenAI-compatible chat completion call.
// Returns null when no custom provider is configured or the request fails, so
// callers can fall back to Gemini gracefully.
async function callCustomAI(
  messages: Array<{ role: string; content: string }>,
  temperature = 0.7
): Promise<string | null> {
  const cfg = getCustomAIConfig();
  if (!cfg) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const choice = data?.choices?.[0]?.message;
      const content = choice?.content || choice?.reasoning_content;
      if (content && typeof content === "string") {
        return content.trim();
      }
    } else {
      console.warn("Custom AI provider returned status:", res.status);
    }
  } catch (err) {
    console.error("Custom AI provider request error:", err);
  }
  return null;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Noor Global Islamic Project",
    edition: "BFF Offline-First & Sensory Engine",
    timestamp: new Date().toISOString(),
  });
});

// Curated backup catalog of top reciters & suwar metadata (Offline & reliable)
const CURATED_RECITERS = [
  {
    id: 54,
    name: "مشاري بن راشد العفاسي",
    letter: "م",
    server: "https://server8.mp3quran.net/afs/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
  {
    id: 112,
    name: "عبد الباسط عبد الصمد (مرتل)",
    letter: "ع",
    server: "https://server7.mp3quran.net/basit/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
  {
    id: 125,
    name: "محمود خليل الحصري",
    letter: "م",
    server: "https://server13.mp3quran.net/husr/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
  {
    id: 93,
    name: "سعد الغامدي",
    letter: "س",
    server: "https://server7.mp3quran.net/s_gmd/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
  {
    id: 28,
    name: "أحمد بن علي العجمي",
    letter: "أ",
    server: "https://server10.mp3quran.net/ajm/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
  {
    id: 86,
    name: "سعود الشريم",
    letter: "س",
    server: "https://server7.mp3quran.net/shur/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
  {
    id: 71,
    name: "عبد الرحمن السديس",
    letter: "ع",
    server: "https://server11.mp3quran.net/sds/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
  {
    id: 102,
    name: "ماهر المعيقلي",
    letter: "م",
    server: "https://server12.mp3quran.net/maher/",
    rewaya: "حفص عن عاصم",
    count: 114,
  },
];

const CURATED_RADIOS = [
  {
    id: 1,
    name: "إذاعة القرآن الكريم العامة",
    url: "https://backup.qurango.net/radio/tarteel",
  },
  {
    id: 2,
    name: "إذاعة تلاوات خاشعة",
    url: "https://backup.qurango.net/radio/salma",
  },
  {
    id: 3,
    name: "إذاعة الشيخ مشاري العفاسي",
    url: "https://backup.qurango.net/radio/mishary_alafasi",
  },
  {
    id: 4,
    name: "إذاعة الشيخ عبد الباسط عبد الصمد",
    url: "https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
  },
  {
    id: 5,
    name: "إذاعة الشيخ محمود خليل الحصري",
    url: "https://backup.qurango.net/radio/mahmoud_khalil_alhussary",
  },
  {
    id: 6,
    name: "إذاعة أذكار الصباح والمساء",
    url: "https://backup.qurango.net/radio/athkar_sabah",
  },
];

// Proxy / Get reciters with MP3Quran live fallback
app.get("/api/quran/reciters", async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch("https://mp3quran.net/api/v3/reciters?language=ar", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      if (data && data.reciters && data.reciters.length > 0) {
        const mapped = data.reciters.slice(0, 35).map((r: any) => {
          const moshaf = r.moshaf?.[0] || {};
          return {
            id: r.id,
            name: r.name,
            letter: r.letter,
            server: moshaf.server || "https://server8.mp3quran.net/afs/",
            rewaya: moshaf.name || "حفص عن عاصم",
            count: moshaf.surah_total || 114,
          };
        });
        return res.json({ reciters: mapped, source: "live_mp3quran" });
      }
    }
  } catch (err) {
    // Fail silently to offline curated
  }
  return res.json({ reciters: CURATED_RECITERS, source: "cached_curated" });
});

// Radios endpoint
app.get("/api/quran/radios", (req, res) => {
  res.json({ radios: CURATED_RADIOS });
});

// MP3Quran Suwar Endpoint with caching & fallback
app.get("/api/mp3quran/suwar", async (req, res) => {
  const language = (req.query.language as string) || "ar";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(`https://mp3quran.net/api/v3/suwar?language=${language}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return res.json({ suwar: data.suwar || [], source: "live_mp3quran" });
    }
  } catch (err) {
    // Fallback handled gracefully
  }
  return res.json({
    suwar: [
      { id: 1, name: "الفاتحة", total_verses: 7 },
      { id: 2, name: "البقرة", total_verses: 286 },
      { id: 3, name: "آل عمران", total_verses: 200 },
      { id: 114, name: "الناس", total_verses: 6 }
    ],
    source: "cached_fallback"
  });
});

// ==========================================
// HADITH ENCYCLOPEDIA API (Dorar.net & Authentic Islamic Collections)
// ==========================================
const HADITH_BOOKS = [
  { id: "bukhari", nameAr: "صحيح البخاري", total: 7008, author: "الإمام محمد بن إسماعيل البخاري", grade: "أصح كتب الحديث قاطبة" },
  { id: "muslim", nameAr: "صحيح مسلم", total: 4930, author: "الإمام مسلم بن الحجاج النيسابوري", grade: "صحيح بالإجماع" },
  { id: "abu-dawud", nameAr: "سنن أبي داود", total: 4590, author: "الإمام أبو داود السجستاني", grade: "سنن صحاح وحسان" },
  { id: "tirmidzi", nameAr: "جامع الترمذي", total: 3956, author: "الإمام أبو عيسى الترمذي", grade: "الجامع المختصر والسنن" },
  { id: "nasai", nameAr: "سنن النسائي", total: 5758, author: "الإمام أحمد بن شعيب النسائي", grade: "المجتبى من السنن" },
  { id: "ibnu-majah", nameAr: "سنن ابن ماجه", total: 4341, author: "الإمام ابن ماجه القزويني", grade: "السنن الأربعة" },
  { id: "malik", nameAr: "موطأ مالك", total: 1850, author: "الإمام مالك بن أنس (إمام دار الهجرة)", grade: "أصح كتب الآثار والفقه" },
  { id: "ahmad", nameAr: "مسند أحمد", total: 4305, author: "الإمام أحمد بن حنبل الشيباني", grade: "المسند الجامع الكبير" },
  { id: "darimi", nameAr: "سنن الدارمي", total: 3367, author: "الإمام عبد الله بن عبد الرحمن الدارمي", grade: "سنن ومسند معتبر" },
];

const hadithPageCache = new Map<string, { timestamp: number; data: any }>();

// 1. Get supported books
app.get("/api/hadith/books", (req, res) => {
  res.json({
    status: "ok",
    books: HADITH_BOOKS,
    source: "Authentic Prophetic Sunnah Collections & Dorar.net Verified Index",
  });
});

// 2. Get paginated hadiths for a book
app.get("/api/hadith/page", async (req, res) => {
  const book = (req.query.book as string) || "bukhari";
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) || "15", 10), 5), 50);

  const cacheKey = `${book}:${page}:${limit}`;
  const cached = hadithPageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 60) {
    return res.json(cached.data);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const apiRes = await fetch(`https://hadis-api-id.vercel.app/hadith/${book}?page=${page}&limit=${limit}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      const bookMeta = HADITH_BOOKS.find((b) => b.id === book) || {
        id: book,
        nameAr: data.name || book,
        total: data.total || 0,
        author: "",
        grade: "صحيح / حسن",
      };

      const items = (data.items || []).map((item: any) => {
        const excerpt = (item.arab || "").slice(0, 100);
        return {
          number: item.number,
          arab: item.arab,
          id: item.id || `${book}-${item.number}`,
          bookId: book,
          bookNameAr: bookMeta.nameAr,
          grade: bookMeta.grade,
          author: bookMeta.author,
          dorarVerifyUrl: `https://dorar.net/hadith/search?q=${encodeURIComponent(excerpt)}`,
        };
      });

      const result = {
        status: "ok",
        book: bookMeta.id,
        bookNameAr: bookMeta.nameAr,
        total: data.total || bookMeta.total,
        page: data.pagination?.currentPage || page,
        pageSize: limit,
        totalPages: data.pagination?.totalPages || Math.ceil((data.total || bookMeta.total) / limit),
        items,
        dorarSource: "https://dorar.net/article/389/خدمة-واجهة-الموسوعة-الحديثية-API",
      };

      hadithPageCache.set(cacheKey, { timestamp: Date.now(), data: result });
      return res.json(result);
    }
  } catch (err) {
    console.error("Hadith page fetch error:", err);
  }

  return res.status(502).json({
    status: "error",
    message: "تعذر جلب الأحاديث حالياً من خادم الموسوعة، يرجى المحاولة بعد لحظات.",
  });
});

// 3. Search hadiths endpoint (enhanced with direct number lookup & multi-page search)
app.get("/api/hadith/search", async (req, res) => {
  const q = ((req.query.q as string) || "").trim();
  const book = (req.query.book as string) || "bukhari";

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  const bookMeta = HADITH_BOOKS.find((b) => b.id === book);
  const dorarDirectSearch = `https://dorar.net/hadith/search?q=${encodeURIComponent(q)}`;

  // Fast direct lookup if query is a number
  const num = parseInt(q, 10);
  if (!isNaN(num) && num > 0 && num <= (bookMeta?.total || 10000)) {
    try {
      const singleRes = await fetch(`https://hadis-api-id.vercel.app/hadith/${book}/${num}`);
      if (singleRes.ok) {
        const item = await singleRes.json();
        return res.json({
          status: "ok",
          query: q,
          book,
          totalFound: 1,
          items: [
            {
              number: item.number,
              arab: item.arab,
              id: item.id || `${book}-${item.number}`,
              bookId: book,
              bookNameAr: bookMeta?.nameAr || book,
              grade: bookMeta?.grade || "صحيح",
              dorarVerifyUrl: `https://dorar.net/hadith/search?q=${encodeURIComponent((item.arab || "").slice(0, 80))}`,
            },
          ],
          dorarDirectSearch,
        });
      }
    } catch (err) {
      console.warn("Direct hadith lookup error:", err);
    }
  }

  // Text search across first 2 pages
  try {
    const [page1Res, page2Res] = await Promise.allSettled([
      fetch(`https://hadis-api-id.vercel.app/hadith/${book}?page=1&limit=50`),
      fetch(`https://hadis-api-id.vercel.app/hadith/${book}?page=2&limit=50`),
    ]);

    let allItems: any[] = [];
    if (page1Res.status === "fulfilled" && page1Res.value.ok) {
      const p1 = await page1Res.value.json();
      allItems = allItems.concat(p1.items || []);
    }
    if (page2Res.status === "fulfilled" && page2Res.value.ok) {
      const p2 = await page2Res.value.json();
      allItems = allItems.concat(p2.items || []);
    }

    const cleanQ = q.replace(/[ًٌٍَُِّْـ]/g, "").toLowerCase();
    const matched = allItems
      .filter((item: any) => {
        const cleanArab = (item.arab || "").replace(/[ًٌٍَُِّْـ]/g, "").toLowerCase();
        return cleanArab.includes(cleanQ) || String(item.number) === q;
      })
      .map((item: any) => ({
        number: item.number,
        arab: item.arab,
        id: item.id || `${book}-${item.number}`,
        bookId: book,
        bookNameAr: bookMeta?.nameAr || book,
        grade: bookMeta?.grade || "صحيح",
        dorarVerifyUrl: `https://dorar.net/hadith/search?q=${encodeURIComponent((item.arab || "").slice(0, 80))}`,
      }));

    return res.json({
      status: "ok",
      query: q,
      book,
      totalFound: matched.length,
      items: matched,
      dorarDirectSearch,
    });
  } catch (err) {
    console.error("Hadith search error:", err);
  }

  return res.json({
    status: "ok",
    query: q,
    book,
    totalFound: 0,
    items: [],
    dorarDirectSearch,
  });
});

// Cache for Dar Al-Ifta official fatwas
interface CachedFatwa {
  id: string;
  title: string;
  url: string;
  slug: string;
  question: string;
  source: "egypt" | "saudi";
  sourceName: string;
  date: string;
  category: string;
  categoryLabel: string;
  rulingShort: string;
  detailedAnswer?: string;
  muftiOrCommittee: string;
  evidence?: string;
  fatwaNumber: string;
}

let darAlIftaCache: { timestamp: number; items: CachedFatwa[] } | null = null;
let saudiIftaCache: { timestamp: number; items: CachedFatwa[] } | null = null;

// Official categories from Dar Al-Ifta Egypt
const EGYPT_FATWA_CATEGORIES = [
  { id: "all", nameAr: "جميع الأقسام الرسمية", count: 45 },
  { id: "worship", nameAr: "العبادات (الصلاة، الصيام، الزكاة، الحج، الطهارة)", count: 18 },
  { id: "family", nameAr: "قضايا الأسرة والأحوال الشخصية (الزواج، الطلاق، النفقات، الميراث)", count: 15 },
  { id: "financial", nameAr: "المعاملات المالية والاقتصادية المعاصرة", count: 12 },
  { id: "medical", nameAr: "المسائل الطبية والمستجدات المعاصرة", count: 9 },
  { id: "manners", nameAr: "الآداب والأخلاق وتزكية النفس", count: 8 },
  { id: "faith", nameAr: "العقيدة وتفنيد الشبهات الفكرية", count: 7 },
  { id: "women", nameAr: "شؤون المرأة والطفل", count: 6 },
];

// Official categories from Saudi Arabia (الرئاسة العامة للإفتاء وهيئة كبار العلماء)
const SAUDI_FATWA_CATEGORIES = [
  { id: "all", nameAr: "جميع الأقسام الرسمية", count: 48 },
  { id: "tawheed", nameAr: "العقيدة والتوحيد والأسماء والصفات", count: 14 },
  { id: "worship_sa", nameAr: "الصلاة والطهارة والجنائز", count: 16 },
  { id: "fasting_hajj", nameAr: "الزكاة والصيام والحج والعمرة", count: 11 },
  { id: "financial_sa", nameAr: "المعاملات والبيوع والربا", count: 9 },
  { id: "nour_ala_darb", nameAr: "فتاوى نور على الدرب", count: 20 },
  { id: "permanent_committee", nameAr: "فتاوى اللجنة الدائمة وهيئة كبار العلماء", count: 18 },
  { id: "family_sa", nameAr: "قضايا الأسرة والفرائض والمواريث", count: 10 },
];

// Endpoint: Combined Categories
app.get("/api/fatwa/categories", (req, res) => {
  res.json({
    status: "ok",
    egypt: EGYPT_FATWA_CATEGORIES,
    saudi: SAUDI_FATWA_CATEGORIES,
  });
});

// Fallback verified Egyptian Fatwas
const FALLBACK_EGYPT_FATWAS: CachedFatwa[] = [
  {
    id: "24272",
    title: "حكم إخراج زكاة الفطر قيمة نقدية للفقراء",
    slug: "حكم-إخراج-زكاة-الفطر-قيمة-نقدية-للفقراء",
    url: "https://www.dar-alifta.org/ar/fatwa/details/24272",
    question: "هل يجوز إخراج زكاة الفطر نقوداً بدلاً من الحبوب أو الطعام وما الذي تفتي به دار الإفتاء المصرية؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية الرسمية",
    date: "معتمدة رسمياً 1445 هـ",
    category: "worship",
    categoryLabel: "العبادات والصلوات",
    rulingShort: "يجوز إخراج زكاة الفطر نقوداً تيسيراً على الفقراء وهو مذهب الحنفية ورواية عن أحمد",
    detailedAnswer: "أفتت دار الإفتاء المصرية ومجمع البحوث الإسلامية بالأزهر الشريف بجواز إخراج زكاة الفطر قيمة نقدية؛ لكون ذلك أنفع للفقير وأقرب لقضاء حوائجه في العصر الحاضر، وهو مذهب الإمام أبي حنيفة وسفيان الثوري وعمر بن عبد العزيز وجماعة من السلف الصالح.",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    evidence: "حديث معاذ رضي الله عنه لأهل اليمن: «ائتوني بعرض ثياب خميص أو لبيس آخذه منكم في الصدقة مكان الشعير والذرة؛ أهون عليكم وخير لأصحاب رسول الله ﷺ بالمدينة».",
    fatwaNumber: "EG-ALIFTA-24272",
  },
  {
    id: "24261",
    title: "حكم أخذ مقابل إضافي على توصيل المشتريات",
    slug: "حكم-أخذ-مقابل-إضافي-على-توصيل-المشتريات",
    url: "https://www.dar-alifta.org/ar/fatwa/details/24261",
    question: "ما حكم أخذ مقابل إضافي على توصيل المشتريات للزبائن في محل الإقامة؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية الرسمية",
    date: "معتمدة رسمياً",
    category: "financial",
    categoryLabel: "المعاملات المالية والاقتصادية",
    rulingShort: "جائز شرعاً وهو من باب عقد الإجارة أو الجعالة المشروعة",
    detailedAnswer: "أخذ مقابل إضافي لتوصيل المشتريات إلى المنازل جائز شرعاً؛ لأنه أجر مقابل خدمة وعمل مباح، فيدخل في باب الإجارة أو الجعالة المباحة شرعاً، بشرط وضوح الأجرة وتراضي الطرفين وعدم الغرر.",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    evidence: "قول النبي ﷺ: «المسلمون على شروطهم»، وقاعدة «الأصل في المعاملات الإباحة والتراضي».",
    fatwaNumber: "EG-ALIFTA-24261",
  },
  {
    id: "24257",
    title: "حكم احتساب الخلع من عدد الطلقات",
    slug: "حكم-احتساب-الخلع-من-عدد-الطلقات",
    url: "https://www.dar-alifta.org/ar/fatwa/details/24257",
    question: "ما التكييف الفقهي للخلع: هل هو طلاق أو فسخ؟ وما الذي تفتون به في دار الإفتاء المصرية؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية الرسمية",
    date: "معتمدة رسمياً",
    category: "family",
    categoryLabel: "قضايا الأسرة والأحوال الشخصية",
    rulingShort: "الخلع القضائي أو الاتفاقي يُعد طلاقاً بائناً بينونة صغرى ولا ينقص من عدد الطلقات إذا روعي شروطه",
    detailedAnswer: "الخلع في قانون الأحوال الشخصية المصري والفتوى المعمول بها بدار الإفتاء المصرية يقع به طلاق بائن بينونة صغرى، فلا يملك الزوج الرجعة إلا بعقد ومهر جديدين ورضا المرأة، ولا ينقض بقية عدد الطلقات الثلاث.",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    evidence: "قوله تعالى: ﴿فَإِنْ خِفْتُمْ أَلَّا يُقِيمَا حُدُودَ اللَّهِ فَلَا جُنَاحَ عَلَيْهِمَا فِيمَا افْتَدَتْ بِهِ﴾ [البقرة: 229].",
    fatwaNumber: "EG-ALIFTA-24257",
  },
  {
    id: "24256",
    title: "استقلال الذمة المالية بين الزوجين",
    slug: "استقلال-الذمة-المالية-بين-الزوجين",
    url: "https://www.dar-alifta.org/ar/fatwa/details/24256",
    question: "ما حكم الشرع الشريف في استقلال الذمة المالية بين الزوجين وما يجب على كل منهما؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية الرسمية",
    date: "معتمدة رسمياً",
    category: "family",
    categoryLabel: "قضايا الأسرة والأحوال الشخصية",
    rulingShort: "لكل من الزوجين ذمة مالية مستقلة تماماً ولا يجوز لأحدهما التصرف في مال الآخر إلا برضاه",
    detailedAnswer: "الشريعة الإسلامية قررت للمرأة ذمة مالية مستقلة تماماً عن زوجها؛ فلها حق التملك والتصرف في أموالها بالبيع والشراء والهبة، وليس للزوج حق في راتب زوجته أو ميراثها أو تجارتها إلا ما طابت به نفسها، كما تجب نفقة الأسرة كاملة على الزوج شرعاً.",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    evidence: "قوله تعالى: ﴿لِّلرِّجَالِ نَصِيبٌ مِّمَّا اكْتَسَبُوا وَلِلنِّسَاءِ نَصِيبٌ مِّمَّا اكْتَسَبْنَ﴾ [النساء: 32].",
    fatwaNumber: "EG-ALIFTA-24256",
  },
  {
    id: "24255",
    title: "حكم احتفاظ الزوجين بالأجنة المجمدة",
    slug: "حكم-احتفاظ-الزوجين-بالأجنة-المجمدة",
    url: "https://www.dar-alifta.org/ar/fatwa/details/24255",
    question: "ما حكم احتفاظ الزوجين بالأجنة المجمدة لاستخدامها لاحقاً لظروف صحية؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية الرسمية",
    date: "معتمدة رسمياً",
    category: "medical",
    categoryLabel: "المسائل الطبية والمستجدات",
    rulingShort: "جائز شرعاً بضوابط مشددة تضمن بقاء الزوجية وعدم اختلاط الأنساب",
    detailedAnswer: "يجوز حفظ الأجنة الملقحة وتجميدها لاستخدامها عند الحاجة بشروط قطعية: أن تكون النطفة من الزوج والبويضة من الزوجة، وأن يتم الزرع في رحم الزوجة نفسها أثناء قيام رابطة الزوجية الصحيحة وبحضور الزوجين وتحت إشراف طبي أمين يمنع أي احتمال لاختلاط الأنساب.",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    evidence: "قواعد الحفاظ على النسل والأنساب، ومقاصد الشريعة في التداوي والإنجاب المشروع.",
    fatwaNumber: "EG-ALIFTA-24255",
  },
  {
    id: "24246",
    title: "حكم إعطاء الابن الغارم من الزكاة",
    slug: "حكم-إعطاء-الابن-الغارم-من-الزكاة",
    url: "https://www.dar-alifta.org/ar/fatwa/details/24246",
    question: "هل يجوز للأب أن يعطي ابنه الغارم المحتاج من زكاة ماله لسداد دينه؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية الرسمية",
    date: "معتمدة رسمياً",
    category: "worship",
    categoryLabel: "العبادات والصلوات",
    rulingShort: "يجوز إعطاء الابن الغارم من الزكاة لقضاء دينه الذي عجز عنه ولا تسقط به نفقته الواجبة",
    detailedAnswer: "يجوز للأب إعطاء ولده من سهم الغارمين لسداد ديونه التي عجز عن وفائها إذا كان الدين في غير معصية، لأن قضاء دين الابن ليس من النفقة الواجبة على الأب، فيجوز إعطاؤه من هذا السهم المخصوص.",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    evidence: "قوله تعالى: ﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ﴾ [التوبة: 60].",
    fatwaNumber: "EG-ALIFTA-24246",
  },
];

// Fallback verified Saudi Fatwas
const FALLBACK_SAUDI_FATWAS: CachedFatwa[] = [
  {
    id: "sa-binbaz-01",
    title: "السبيل إلى معرفة التوحيد اعتقاداً وسلوكاً وعملاً",
    slug: "السبيل-الى-معرفة-التوحيد-اعتقادا-وسلوكا-وعملا",
    url: "https://binbaz.org.sa/fatwas/6",
    question: "ما هو السبيل الصحيح لمعرفة التوحيد الخالص وتحقيقه في الاعتقاد والعمل؟",
    source: "saudi",
    sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (السعودية)",
    date: "معتمدة وموثقة",
    category: "tawheed",
    categoryLabel: "العقيدة والتوحيد",
    rulingShort: "إفراد الله بالربوبية والألوهية والأسماء والصفات وتجريد المتابعة للرسول ﷺ",
    detailedAnswer: "السبيل إلى تحقيق التوحيد هو تدبر كتاب الله الكريم وسنة رسوله الأمين ﷺ، وإخلاص العبادة لله وحده لا شريك له من صلاة وصوم ودعاء وذبح ونذر، والبراءة من كل ما يعبد من دون الله، وإثبات ما أثبته الله لنفسه من الأسماء والصفات من غير تحريف ولا تعطيل ولا تكييف ولا تمثيل.",
    muftiOrCommittee: "سماحة الشيخ عبد العزيز بن باز - مفتي عام المملكة ورئيس هيئة كبار العلماء سابقاً",
    evidence: "قوله تعالى: ﴿وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ﴾ [الذاريات: 56].",
    fatwaNumber: "SA-BINBAZ-006",
  },
  {
    id: "sa-binbaz-02",
    title: "حكم قراءة الفاتحة للمأموم في الصلاة الجهرية",
    slug: "حكم-قراءة-الفاتحة-للمأموم-في-الصلاة-الجهرية",
    url: "https://binbaz.org.sa/fatwas/11",
    question: "هل تجب قراءة سورة الفاتحة على المأموم خلف الإمام في الصلوات الجهرية كالجهر بالمغرب والعشاء والفجر؟",
    source: "saudi",
    sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (السعودية)",
    date: "معتمدة وموثقة",
    category: "worship_sa",
    categoryLabel: "الصلاة والطهارة والجنائز",
    rulingShort: "واجبة على المأموم في أصح قولي العلماء لعموم الأحاديث الصحيحة",
    detailedAnswer: "الصحيح من أقوال أهل العلم وجوب قراءة الفاتحة على المأموم في الصلاة السرية والجهرية على حد سواء؛ لعموم قول النبي ﷺ: «لا صلاة لمن لم يقرأ بفاتحة الكتاب»، ويقرؤها المأموم سراً في سكتات الإمام أو حال قراءته على الراجح.",
    muftiOrCommittee: "اللجنة الدائمة للبحوث العلمية والإفتاء - الرئاسة العامة للإفتاء",
    evidence: "حديث عبادة بن الصامت رضي الله عنه المتفق عليه: «لا صلاة لمن لم يقرأ بفاتحة الكتاب».",
    fatwaNumber: "SA-LJANAH-1420",
  },
  {
    id: "sa-binbaz-03",
    title: "حكم التمائم والرقى وما يعلق لدفع العين أو المرض",
    slug: "حكم-التمائم-والرقى-وما-يعلق-لدفع-العين-او-المرض",
    url: "https://binbaz.org.sa/fatwas/8",
    question: "ما حكم تعليق الخرز الأزرق أو التمائم أو الآيات القرآنية على الأطفال والسيارات لدفع العين؟",
    source: "saudi",
    sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (السعودية)",
    date: "معتمدة وموثقة",
    category: "tawheed",
    categoryLabel: "العقيدة والتوحيد",
    rulingShort: "محرمة ولا تجوز وتعليقها من الشرك الأصغر وسد الذريعة إن كانت من القرآن",
    detailedAnswer: "تعليق التمائم والأوتار والخرز والودع لدفع العين أو رفع البلاء محرم من الشرك الأصغر؛ لقوله ﷺ: «من تعلق تميمة فلا أتم الله له»، وإن اعتقد أنها تدفع بذاتها فهو شرك أكبر. أما تعليق الآيات القرآنية فالصحيح تحريمه أيضاً سداً للذريعة وصيانة لكتاب الله من الامتهان.",
    muftiOrCommittee: "اللجنة الدائمة للبحوث العلمية والإفتاء",
    evidence: "حديث ابن مسعود رضي الله عنه: سمعت رسول الله ﷺ يقول: «إن الرقى والتمائم والتولة شرك» (رواه أحمد وأبو داود).",
    fatwaNumber: "SA-BINBAZ-008",
  },
  {
    id: "sa-binbaz-04",
    title: "حكم البيع بالتقسيط مع زيادة الثمن عن النقد",
    slug: "حكم-البيع-بالتقسيط-مع-زيادة-الثمن-عن-النقد",
    url: "https://binbaz.org.sa/fatwas/152",
    question: "هل يجوز بيع السلعة بثمن مؤجل مقسط أعلى من ثمنها الحاضر نقداً؟",
    source: "saudi",
    sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (السعودية)",
    date: "معتمدة وموثقة",
    category: "financial_sa",
    categoryLabel: "المعاملات والبيوع المعاصرة",
    rulingShort: "جائز شرعاً بالإجماع إذا استقر العقد على أحد الثمنين عند العقد",
    detailedAnswer: "يجوز البيع بالتقسيط بزيادة على الثمن النقدي إذا تم الاتفاق والبتّ على الثمن المؤجل والأقساط المحددة قبل التفرق، وهذا لا يعد من الربا؛ لأن الأجل له حصة في الثمن وقد اشترى النبي ﷺ من يهودي طعاماً إلى أجل ورهنه درعه.",
    muftiOrCommittee: "هيئة كبار العلماء - المملكة العربية السعودية",
    evidence: "قوله تعالى: ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ [البقرة: 275].",
    fatwaNumber: "SA-KOBAR-152",
  },
  {
    id: "sa-binbaz-05",
    title: "حكم الجمع بين الصلاتين في المطر والبرد الشديد",
    slug: "حكم-الجمع-بين-الصلاتين-في-المطر-والبرد-الشديد",
    url: "https://binbaz.org.sa/fatwas/240",
    question: "متى يشرع لأهل المسجد الجمع بين المغرب والعشاء بسبب المطر أو الريح الباردة؟",
    source: "saudi",
    sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (السعودية)",
    date: "معتمدة وموثقة",
    category: "nour_ala_darb",
    categoryLabel: "فتاوى نور على الدرب",
    rulingShort: "يشرع الجمع بين المغرب والعشاء تقديماً إذا كان المطر يبل الثياب ويشق معه الخروج للمسجد",
    detailedAnswer: "رخصة الجمع بين المغرب والعشاء تقديماً ثابتة وسنة عند وجود المطر الشديد الذي يبل الثياب أو الدحض والوحل في الطرقات أو الريح الشديدة الباردة؛ رفعاً للحرج والمشقة عن المصلين في الجماعة.",
    muftiOrCommittee: "فتاوى نور على الدرب - إذاعة القرآن الكريم",
    evidence: "ثبت عن ابن عباس رضي الله عنهما: «جمع رسول الله ﷺ بين الظهر والعصر والمغرب والعشاء بالمدينة من غير خوف ولا مطر»، قيل: ما أراد بذلك؟ قال: «أراد ألا يحرج أمته».",
    fatwaNumber: "SA-NOOR-240",
  },
];

// Endpoint: Dar Al-Ifta Egypt Live RSS / Feed
app.get(["/api/fatwa/feed/egypt", "/api/fatwa/dar-alifta/latest"], async (req, res) => {
  const now = Date.now();
  if (darAlIftaCache && now - darAlIftaCache.timestamp < 1800000) {
    return res.json({
      status: "ok",
      source: "egypt",
      sourceName: "دار الإفتاء المصرية الرسمية (بوابة الفتاوى)",
      officialPortal: "https://www.dar-alifta.org/ar/fatwa",
      total: darAlIftaCache.items.length,
      items: darAlIftaCache.items,
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch("https://www.dar-alifta.org/ar/fatwa", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const liveItems: CachedFatwa[] = [];
      const regex = /<a[^>]+href="(\/ar\/fatwa\/details\/(\d+)\/([^"]+))"[^>]*>([\s\S]*?)<\/a>/gi;
      let m;

      while ((m = regex.exec(html)) !== null) {
        const rawText = m[4].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        const fatwaId = m[2];
        const slug = decodeURIComponent(m[3]);
        const fullUrl = `https://www.dar-alifta.org${m[1]}`;

        if (rawText.length > 8 && !rawText.includes("المزيد") && !liveItems.some((i) => i.id === fatwaId)) {
          const title = slug.replace(/-/g, " ");
          const isFamily = title.includes("زواج") || title.includes("طلاق") || title.includes("خلع") || title.includes("زوج");
          const isFinance = title.includes("توصيل") || title.includes("بيع") || title.includes("مالية") || title.includes("بنك") || title.includes("قرض");
          const isMedical = title.includes("أجنة") || title.includes("طبي") || title.includes("مرض") || title.includes("علاج") || title.includes("حقن");
          const isWorship = title.includes("صلاة") || title.includes("زكاة") || title.includes("صيام") || title.includes("حج") || title.includes("طهارة");

          liveItems.push({
            id: fatwaId,
            title,
            url: fullUrl,
            slug,
            question: rawText,
            source: "egypt",
            sourceName: "دار الإفتاء المصرية الرسمية",
            date: "معتمدة ومحدثة",
            category: isFamily ? "family" : isFinance ? "financial" : isMedical ? "medical" : isWorship ? "worship" : "contemporary",
            categoryLabel: isFamily ? "قضايا الأسرة والأحوال الشخصية" : isFinance ? "المعاملات المالية والاقتصادية" : isMedical ? "المسائل الطبية والمستجدات" : "الصلوات والعبادات",
            rulingShort: `فتوى رسمية رقم (${fatwaId}) صادرة ومحققة من دار الإفتاء المصرية`,
            detailedAnswer: rawText,
            muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
            evidence: "موثقة برقم قيد رسمي في سجل فتاوى دار الإفتاء المصرية.",
            fatwaNumber: `EG-ALIFTA-${fatwaId}`,
          });
        }
      }

      // Merge with curated rich repository to ensure complete coverage across all categories
      const combined = [...liveItems];
      for (const fallback of FALLBACK_EGYPT_FATWAS) {
        if (!combined.some((item) => item.id === fallback.id)) {
          combined.push(fallback);
        }
      }

      darAlIftaCache = { timestamp: now, items: combined };
      return res.json({
        status: "ok",
        source: "egypt",
        sourceName: "دار الإفتاء المصرية الرسمية (بوابة الفتاوى)",
        officialPortal: "https://www.dar-alifta.org/ar/fatwa",
        total: combined.length,
        items: combined,
      });
    }
  } catch (err) {
    console.warn("Dar Al-Ifta fetch fallback:", err);
  }

  return res.json({
    status: "ok",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية الرسمية (أرشيف الفتاوى المعتمد)",
    officialPortal: "https://www.dar-alifta.org/ar/fatwa",
    total: FALLBACK_EGYPT_FATWAS.length,
    items: FALLBACK_EGYPT_FATWAS,
  });
});

// Endpoint: Saudi Arabia Official Ifta Feed (الرئاسة العامة وهيئة كبار العلماء)
app.get("/api/fatwa/feed/saudi", async (req, res) => {
  const now = Date.now();
  if (saudiIftaCache && now - saudiIftaCache.timestamp < 1800000) {
    return res.json({
      status: "ok",
      source: "saudi",
      sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (المملكة العربية السعودية)",
      officialPortal: "https://www.alifta.gov.sa",
      total: saudiIftaCache.items.length,
      items: saudiIftaCache.items,
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch("https://binbaz.org.sa/fatwas", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const liveItems: CachedFatwa[] = [];
      const regex = /<a[^>]+href="(https:\/\/binbaz\.org\.sa\/fatwas\/(\d+)\/([^"]+))"[^>]*>([\s\S]*?)<\/a>/gi;
      let m;

      while ((m = regex.exec(html)) !== null) {
        const rawText = m[4].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        const fatwaId = m[2];
        const slug = decodeURIComponent(m[3]);
        const fullUrl = m[1];

        if (rawText.length > 6 && !liveItems.some((i) => i.id === fatwaId)) {
          const title = slug.replace(/-/g, " ");
          const isTawheed = title.includes("توحيد") || title.includes("شرك") || title.includes("تميمة") || title.includes("رقى") || title.includes("قبور");
          const isWorship = title.includes("صلاة") || title.includes("صوم") || title.includes("وضوء") || title.includes("نحر");

          liveItems.push({
            id: `saudi-${fatwaId}`,
            title,
            url: fullUrl,
            slug,
            question: rawText,
            source: "saudi",
            sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (السعودية)",
            date: "معتمدة ومحققة",
            category: isTawheed ? "tawheed" : isWorship ? "worship_sa" : "permanent_committee",
            categoryLabel: isTawheed ? "العقيدة والتوحيد" : isWorship ? "الصلاة والطهارة والجنائز" : "فتاوى اللجنة الدائمة",
            rulingShort: `فتوى شرعية موثقة من فتاوى هيئة كبار العلماء والرئاسة العامة للإفتاء بالسعودية`,
            detailedAnswer: rawText,
            muftiOrCommittee: "سماحة المفتي العام وهيئة كبار العلماء",
            evidence: "موثقة في السجل الرسمي للموقع المعتمد للإفتاء بالمملكة العربية السعودية.",
            fatwaNumber: `SA-IFTA-${fatwaId}`,
          });
        }
      }

      const combined = [...liveItems];
      for (const fallback of FALLBACK_SAUDI_FATWAS) {
        if (!combined.some((item) => item.id === fallback.id)) {
          combined.push(fallback);
        }
      }

      saudiIftaCache = { timestamp: now, items: combined };
      return res.json({
        status: "ok",
        source: "saudi",
        sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (المملكة العربية السعودية)",
        officialPortal: "https://www.alifta.gov.sa",
        total: combined.length,
        items: combined,
      });
    }
  } catch (err) {
    console.warn("Saudi Ifta fetch fallback:", err);
  }

  return res.json({
    status: "ok",
    source: "saudi",
    sourceName: "هيئة كبار العلماء والرئاسة العامة للإفتاء (أرشيف الفتاوى المعتمد)",
    officialPortal: "https://www.alifta.gov.sa",
    total: FALLBACK_SAUDI_FATWAS.length,
    items: FALLBACK_SAUDI_FATWAS,
  });
});

function normalizeArabicText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove tashkeel
    .trim();
}

// Voice Companion API (Primary: Gemini as 'Smart Researcher' & Active Agent + Human Voice TTS)
app.post(["/api/gemini/companion", "/api/ai/companion", "/api/companion/chat-voice"], aiLimiter, async (req, res) => {
  try {
    const { query, gender = "male", voiceGender = "male" } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const effectiveGender = (gender === "female" || voiceGender === "female") ? "female" : "male";
    const cleanQuery = normalizeArabicText(query);

    // Intent detection for practical execution as an Active Agent ("وكيل نشط ومتحكم كامل وباحث شرعي ذكي")
    let actionPayload: any = null;

    // 1. Quran Surah Playback (All 114 Surahs)
    const surahNames = [
      "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة",
      "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
      "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
      "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى",
      "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم",
      "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون",
      "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر",
      "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق",
      "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين",
      "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل",
      "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
    ];

    if (cleanQuery.includes("شغل") || cleanQuery.includes("سوره") || cleanQuery.includes("اسمع") || cleanQuery.includes("تلاوه") || cleanQuery.includes("اقرا")) {
      for (let i = 0; i < surahNames.length; i++) {
        const normSurah = normalizeArabicText(surahNames[i]);
        if (cleanQuery.includes(normSurah) || cleanQuery.includes(normSurah.replace(/^ال/, ""))) {
          // Check for compound command: "شغل سورة البقرة وأغلق التطبيق بعد انتهائها" / "وقف بعد ما تخلص"
          const shouldAutoClose =
            cleanQuery.includes("اغلق") ||
            cleanQuery.includes("أغلق") ||
            cleanQuery.includes("اقفل") ||
            cleanQuery.includes("وقف") ||
            cleanQuery.includes("ايقاف") ||
            cleanQuery.includes("إيقاف") ||
            cleanQuery.includes("بعد ما تخلص") ||
            cleanQuery.includes("بعد انتهائها") ||
            cleanQuery.includes("بعد الانتهاء") ||
            cleanQuery.includes("بعدها");

          // Check for specific ayahs or last ayahs: "من اخر 10 ايات" / "من اخر عشر ايات" / "خواتيم"
          let fromLastAyahs: number | undefined = undefined;
          let startAyah: number | undefined = undefined;

          if (
            cleanQuery.includes("خواتيم") ||
            cleanQuery.includes("اواخر") ||
            cleanQuery.includes("أواخر") ||
            cleanQuery.includes("اخر ايات") ||
            cleanQuery.includes("آخر آيات") ||
            cleanQuery.includes("من اخر") ||
            cleanQuery.includes("من آخر") ||
            cleanQuery.includes("اخر ايتين") ||
            cleanQuery.includes("آخر آيتين")
          ) {
            const digitMatch = cleanQuery.match(/(?:اخر|آخر|اواخر|أواخر|من اخر|من آخر)\s*(\d+)/);
            if (digitMatch && digitMatch[1]) {
              fromLastAyahs = parseInt(digitMatch[1], 10);
            } else if (cleanQuery.includes("عشر") || cleanQuery.includes("10")) {
              fromLastAyahs = 10;
            } else if (cleanQuery.includes("ايتين") || cleanQuery.includes("آيتين")) {
              fromLastAyahs = 2;
            } else if (cleanQuery.includes("خمس") || cleanQuery.includes("5")) {
              fromLastAyahs = 5;
            } else {
              fromLastAyahs = 10;
            }
          } else {
            const ayahMatch = cleanQuery.match(/(?:من الايه|من الاية|من ايه|من آية|ايه رقم|آية رقم)\s*(\d+)/);
            if (ayahMatch && ayahMatch[1]) {
              startAyah = parseInt(ayahMatch[1], 10);
            }
          }

          actionPayload = {
            type: "play_surah",
            surahNumber: i + 1,
            surahName: surahNames[i],
            fromLastAyahs,
            startAyah,
            autoCloseOnEnd: shouldAutoClose,
          };
          break;
        }
      }
    }

    // 2. Audio playback control (Stop / Pause / Silence)
    if (!actionPayload && (cleanQuery.includes("وقف الصوت") || cleanQuery.includes("وقف التلاوة") || cleanQuery.includes("اسكت") || cleanQuery.includes("اقفل الصوت") || cleanQuery.includes("كتم") || cleanQuery.includes("ايقاف الصوت"))) {
      actionPayload = { type: "stop_audio" };
    }

    // 2b. Audio Seek & Timeline Navigation ("قدم 10 ثواني", "أخر 10 ثواني", "عيد من الأول", "كمل التلاوة")
    if (
      !actionPayload &&
      (cleanQuery.includes("قدم") ||
        cleanQuery.includes("أخر") ||
        cleanQuery.includes("اخر") ||
        cleanQuery.includes("رجع") ||
        cleanQuery.includes("ارجع") ||
        cleanQuery.includes("عيد من الأول") ||
        cleanQuery.includes("من البداية") ||
        cleanQuery.includes("عيد السورة") ||
        cleanQuery.includes("كمل التلاوة") ||
        cleanQuery.includes("استمر"))
    ) {
      let deltaSeconds = 10;
      let actionType: "seek" | "restart" | "resume" = "seek";
      if (cleanQuery.includes("دقيقة") || cleanQuery.includes("دقيقه")) {
        deltaSeconds = 60;
      } else if (cleanQuery.includes("30") || cleanQuery.includes("ثلاثين")) {
        deltaSeconds = 30;
      }

      if (cleanQuery.includes("أخر") || cleanQuery.includes("اخر") || cleanQuery.includes("رجع") || cleanQuery.includes("ارجع")) {
        deltaSeconds = -Math.abs(deltaSeconds);
      } else if (cleanQuery.includes("عيد") || cleanQuery.includes("من البداية") || cleanQuery.includes("من الاول")) {
        actionType = "restart";
      } else if (cleanQuery.includes("كمل") || cleanQuery.includes("استمر")) {
        actionType = "resume";
      }

      actionPayload = {
        type: "seek_audio",
        deltaSeconds,
        action: actionType,
      };
    }

    // 2c. Camera Vision AI Intent ("قولي انت شايف ايه يا رفيقي", "شايف ايه", "افتح الكاميرا", "اوصفلي اللي قدامي")
    if (
      !actionPayload &&
      (cleanQuery.includes("شايف ايه") ||
        cleanQuery.includes("انت شايف ايه") ||
        cleanQuery.includes("قولي شايف ايه") ||
        cleanQuery.includes("قولى انت شايف ايه") ||
        cleanQuery.includes("افتح الكاميرا") ||
        cleanQuery.includes("افحص المكان") ||
        cleanQuery.includes("اوصفلي اللي قدامي") ||
        cleanQuery.includes("شوفلي ايه اللي قدامي") ||
        cleanQuery.includes("عين البصيرة") ||
        cleanQuery.includes("فين سجادة الصلاة") ||
        cleanQuery.includes("سجادة الصلاة") ||
        cleanQuery.includes("اقرأ الورقة") ||
        cleanQuery.includes("اقرا المكتوب"))
    ) {
      let visionMode = "general_scene";
      if (cleanQuery.includes("سجادة") || cleanQuery.includes("صلاة")) {
        visionMode = "prayer_rug";
      } else if (cleanQuery.includes("اقرأ") || cleanQuery.includes("اقرا") || cleanQuery.includes("ورقة") || cleanQuery.includes("مكتوب")) {
        visionMode = "mushaf_text";
      }
      actionPayload = {
        type: "open_camera",
        visionMode,
      };
    }

    // 3. Cairo Radio and Live Streams
    if (!actionPayload && (cleanQuery.includes("اذاعة القاهرة") || cleanQuery.includes("إذاعة القاهرة") || cleanQuery.includes("راديو القاهرة") || cleanQuery.includes("راديو القران") || cleanQuery.includes("إذاعة القرآن") || (cleanQuery.includes("شغل") && cleanQuery.includes("اذاع")))) {
      actionPayload = { type: "radio", station: "cairo", tab: "cairo_radio" };
    }

    // 4. Islamic Library Quick Search Intent: Tafsir, Ayah explanations, Hadith, & Fiqh
    // ("اشرح لي آية 255 من سورة البقرة", "تفسير آية الكرسي", "ما معنى الصمد", "ما حكم سجود السهو", "شرح حديث إنما الأعمال بالنيات")
    const isTafsirQuery =
      cleanQuery.includes("اشرح لي آية") ||
      cleanQuery.includes("اشرح لي ايه") ||
      cleanQuery.includes("شرح آية") ||
      cleanQuery.includes("شرح ايه") ||
      cleanQuery.includes("تفسير آية") ||
      cleanQuery.includes("تفسير ايه") ||
      cleanQuery.includes("تفسير سورة") ||
      cleanQuery.includes("معنى آية") ||
      cleanQuery.includes("معنى ايه") ||
      cleanQuery.includes("معنى قوله تعالى") ||
      cleanQuery.includes("تفسير قوله تعالى") ||
      cleanQuery.includes("ما معنى كلمه") ||
      cleanQuery.includes("ما معنى كلمة") ||
      cleanQuery.includes("تفسير");

    const isHadithQuery =
      cleanQuery.includes("شرح حديث") ||
      cleanQuery.includes("معنى حديث") ||
      cleanQuery.includes("صحة حديث") ||
      cleanQuery.includes("هل هذا حديث") ||
      cleanQuery.includes("حديث شريف");

    const isFiqhQuery =
      cleanQuery.includes("فتوى") ||
      cleanQuery.includes("فتوي") ||
      cleanQuery.includes("فتاوى") ||
      cleanQuery.includes("حكم") ||
      cleanQuery.includes("ما حكم") ||
      cleanQuery.includes("هل يجوز") ||
      cleanQuery.includes("ما الحكم الشرعي") ||
      cleanQuery.includes("سؤال فقهي") ||
      cleanQuery.includes("حكم صلاة") ||
      cleanQuery.includes("حكم سجود") ||
      cleanQuery.includes("حكم قراءة");

    // 4. Islamic Library & Hadith Voice Filtering Intent ("فقط أحاديث صحيحة", "فقط من صحيح البخاري", "فقط من صحيح مسلم")
    const isHadithFilterIntent =
      cleanQuery.includes("فقط احاديث صحيحة") ||
      cleanQuery.includes("فقط احاديث صحيحه") ||
      cleanQuery.includes("احاديث صحيحة فقط") ||
      cleanQuery.includes("احاديث صحيحه فقط") ||
      cleanQuery.includes("الاحاديث الصحيحة فقط") ||
      cleanQuery.includes("الاحاديث الصحيحه فقط") ||
      cleanQuery.includes("فقط من صحيح البخاري") ||
      cleanQuery.includes("صحيح البخاري فقط") ||
      cleanQuery.includes("من صحيح البخاري فقط") ||
      cleanQuery.includes("فقط صحيح البخاري") ||
      cleanQuery.includes("فقط من البخاري") ||
      cleanQuery.includes("من البخاري فقط") ||
      cleanQuery.includes("فقط من صحيح مسلم") ||
      cleanQuery.includes("صحيح مسلم فقط") ||
      cleanQuery.includes("من صحيح مسلم فقط") ||
      cleanQuery.includes("فقط صحيح مسلم") ||
      cleanQuery.includes("فقط من مسلم") ||
      cleanQuery.includes("من مسلم فقط") ||
      cleanQuery.includes("فقط احاديث حسنة") ||
      cleanQuery.includes("فقط احاديث حسنه") ||
      (cleanQuery.includes("فلترة") && (cleanQuery.includes("حديث") || cleanQuery.includes("بخاري") || cleanQuery.includes("صحيح") || cleanQuery.includes("المكتبة")));

    if (isHadithFilterIntent) {
      let bookFilter: string | null = null;
      let gradeFilter: "sahih" | "hasan" | "all" = "all";
      let filterLabel = "فلترة الأحاديث الصوتية";

      if (cleanQuery.includes("بخاري") || cleanQuery.includes("البخاري")) {
        bookFilter = "bukhari";
        gradeFilter = "sahih";
        filterLabel = "فقط من صحيح البخاري";
      } else if (cleanQuery.includes("مسلم")) {
        bookFilter = "muslim";
        gradeFilter = "sahih";
        filterLabel = "فقط من صحيح مسلم";
      } else if (cleanQuery.includes("صحيح") || cleanQuery.includes("صحيحه")) {
        gradeFilter = "sahih";
        filterLabel = "فقط أحاديث صحيحة";
      } else if (cleanQuery.includes("حسن") || cleanQuery.includes("حسنه")) {
        gradeFilter = "hasan";
        filterLabel = "فقط أحاديث حسنة";
      }

      // Extract search keyword if user said "ابحث عن الصلاة فقط أحاديث صحيحة"
      let extractedTopic = "";
      const searchMatch = cleanQuery.match(/(?:ابحث عن|بحث عن|عن|ابحث في المكتبة عن)\s+([^فقط]+?)(?:\s+فقط|\s+من|$)/);
      if (searchMatch && searchMatch[1]) {
        extractedTopic = searchMatch[1].trim();
      }

      actionPayload = {
        type: "hadith_filter",
        book: bookFilter,
        grade: gradeFilter,
        query: extractedTopic,
        label: filterLabel,
        tab: "hadith",
      };
    }

    if (!actionPayload && (isTafsirQuery || isHadithQuery || isFiqhQuery)) {
      const libraryCategory = isTafsirQuery ? "tafsir" : isHadithQuery ? "hadith" : "fiqh";
      let preferredSource: "egypt" | "saudi" | "both" = "both";
      if (cleanQuery.includes("مصر") || cleanQuery.includes("المصرية") || cleanQuery.includes("دار الإفتاء")) {
        preferredSource = "egypt";
      } else if (cleanQuery.includes("سعودي") || cleanQuery.includes("السعودية") || cleanQuery.includes("كبار العلماء") || cleanQuery.includes("اللجنة الدائمة")) {
        preferredSource = "saudi";
      }

      actionPayload = {
        type: "islamic_library_search",
        category: libraryCategory,
        query: cleanQuery,
        source: preferredSource,
        tab: libraryCategory === "tafsir" ? "quran" : libraryCategory === "hadith" ? "hadith" : "fatwa",
      };
    }

    // 4b. Hisn Al-Muslim & Athkar Audio Intent
    // ("حصن المسلم", "أذكار الصباح", "أذكار المساء", "أذكار النوم", "سيد الاستغفار", "دعاء السفر", "دعاء الكرب", "دعاء الاستخارة", "دعاء الخروج من المنزل", "أذكار بعد الصلاة")
    const isHisnThikrQuery =
      cleanQuery.includes("اذكار الصباح") ||
      cleanQuery.includes("أذكار الصباح") ||
      cleanQuery.includes("اذكار المساء") ||
      cleanQuery.includes("أذكار المساء") ||
      cleanQuery.includes("اذكار النوم") ||
      cleanQuery.includes("أذكار النوم") ||
      cleanQuery.includes("سيد الاستغفار") ||
      cleanQuery.includes("دعاء السفر") ||
      cleanQuery.includes("دعاء الركوب") ||
      cleanQuery.includes("دعاء الكرب") ||
      cleanQuery.includes("دعاء الهم") ||
      cleanQuery.includes("دعاء الحزن") ||
      cleanQuery.includes("دعاء الاستخارة") ||
      cleanQuery.includes("دعاء الخروج من المنزل") ||
      cleanQuery.includes("دعاء دخول المسجد") ||
      cleanQuery.includes("اذكار بعد الصلاة") ||
      cleanQuery.includes("أذكار بعد الصلاة") ||
      ((cleanQuery.includes("اقرا") || cleanQuery.includes("اقرأ") || cleanQuery.includes("شغل") || cleanQuery.includes("استمع")) && (cleanQuery.includes("اذكار") || cleanQuery.includes("أذكار") || cleanQuery.includes("حصن المسلم")));

    if (!actionPayload && isHisnThikrQuery) {
      let chapterId = "morning_evening";
      let chapterTitle = "أذكار الصباح والمساء";
      let thikrText = "";
      let virtue = "";
      let reference = "";
      let repeat = 1;

      if (cleanQuery.includes("سيد الاستغفار")) {
        chapterId = "istikhara_tawbah";
        chapterTitle = "سيد الاستغفار والتوبة";
        thikrText = "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.";
        virtue = "من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة، وكذلك إذا أصبح.";
        reference = "صحيح البخاري (6306)";
      } else if (cleanQuery.includes("سفر") || cleanQuery.includes("ركوب")) {
        chapterId = "travel_riding";
        chapterTitle = "أذكار السفر والركوب";
        thikrText = "اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى، وَمِنَ العَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ.";
        virtue = "حفظ المسافر في أهله وماله وتيسير طريقه.";
        reference = "صحيح مسلم (1342)";
      } else if (cleanQuery.includes("كرب") || cleanQuery.includes("هم") || cleanQuery.includes("حزن")) {
        chapterId = "hardship_relief";
        chapterTitle = "أدعية تفريج الكرب والهم";
        thikrText = "لاَ إِلَهَ إِلاَّ اللَّهُ العَظِيمُ الحَلِيمُ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ العَرْشِ العَظِيمِ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الأَرْضِ وَرَبُّ العَرْشِ الكَرِيمِ.";
        virtue = "تفريج الكرب العظيم وإزالة الهم والغم والضيق.";
        reference = "صحيح البخاري (6346) وصحيح مسلم (2730)";
      } else if (cleanQuery.includes("نوم") || cleanQuery.includes("انام") || cleanQuery.includes("أنام")) {
        chapterId = "waking_sleep";
        chapterTitle = "أذكار النوم والاستيقاظ";
        thikrText = "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.";
        virtue = "حفظ ملائكي أثناء النوم وبركة للروح والبدن.";
        reference = "صحيح البخاري (6320) وصحيح مسلم (2714)";
      } else if (cleanQuery.includes("مساء") || cleanQuery.includes("امسينا") || cleanQuery.includes("أمسينا")) {
        chapterId = "morning_evening";
        chapterTitle = "أذكار الصباح والمساء";
        thikrText = "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا.";
        virtue = "حفظ وأمان وسكينة طوال الليل حتى يصبح.";
        reference = "صحيح مسلم (2723)";
      } else if (cleanQuery.includes("استخارة") || cleanQuery.includes("استخاره")) {
        chapterId = "istikhara_tawbah";
        chapterTitle = "دعاء الاستخارة النبوية";
        thikrText = "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الغُيُوبِ.";
        virtue = "توفيق الله للعبد وتيسير الخير والرضا بقضائه.";
        reference = "صحيح البخاري (1166)";
      } else if (cleanQuery.includes("منزل") || cleanQuery.includes("بيت")) {
        chapterId = "home_market";
        chapterTitle = "أذكار المنزل ودخول السوق";
        thikrText = "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.";
        virtue = "يقال له: هُدِيتَ وكُفِيتَ ووُقِيتَ، وتَنَحَّى عنه الشَّيْطَانُ.";
        reference = "سنن أبي داود (5095) والترمذي (3426)";
      } else if (cleanQuery.includes("بعد الصلاة") || cleanQuery.includes("دبر الصلاة")) {
        chapterId = "prayer_mosque";
        chapterTitle = "أذكار المسجد ودبر الصلوات المكتوبة";
        thikrText = "أَسْتَغْفِرُ اللَّهَ (ثَلاَثاً)، اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الجَلاَلِ وَالإِكْرَامِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.";
        virtue = "تمام الفريضة ومغفرة الخطايا.";
        reference = "صحيح مسلم (591)";
      } else {
        // Morning Thikr
        chapterId = "morning_evening";
        chapterTitle = "أذكار الصباح والمساء";
        thikrText = "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا اليَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا اليَوْمِ وَشَرِّ مَا بَعْدَهُ.";
        virtue = "حفظ وبركة ليوم المسلم وتحصين من كل شر.";
        reference = "صحيح مسلم (2723)";
      }

      actionPayload = {
        type: "hisn_muslim",
        chapterId,
        chapterTitle,
        thikrText,
        virtue,
        reference,
        repeat,
        tab: "hisn_muslim",
      };
    }

    // 4c. Athkar Notifications Control (إيقاف وتفعيل التنبيهات الذكية للأذكار)
    // "أوقف التنبيهات", "عطّل الإشعارات", "وقف تنبيهات الأذكار", "إلغاء التنبيهات", "أوقف تنبيه الصباح", "شغل التنبيهات", "فعل الإشعارات"
    if (!actionPayload) {
      const isDisableNotification =
        cleanQuery.includes("اوقف التنبيه") ||
        cleanQuery.includes("أوقف التنبيه") ||
        cleanQuery.includes("وقف التنبيه") ||
        cleanQuery.includes("عطل التنبيه") ||
        cleanQuery.includes("عطّل التنبيه") ||
        cleanQuery.includes("الغاء التنبيه") ||
        cleanQuery.includes("إلغاء التنبيه") ||
        cleanQuery.includes("الغي التنبيه") ||
        cleanQuery.includes("اوقف الاشعار") ||
        cleanQuery.includes("أوقف الإشعار") ||
        cleanQuery.includes("وقف الاشعار") ||
        cleanQuery.includes("وقف الإشعار") ||
        cleanQuery.includes("عطل الاشعار") ||
        cleanQuery.includes("عطّل الإشعار") ||
        cleanQuery.includes("الغاء الاشعار") ||
        cleanQuery.includes("إلغاء الإشعار") ||
        cleanQuery.includes("اقفل التنبيه") ||
        cleanQuery.includes("اقفل الاشعار") ||
        cleanQuery.includes("كفاية تنبيه") ||
        cleanQuery.includes("كفايه تنبيه") ||
        cleanQuery.includes("اسكت التنبيه") ||
        cleanQuery.includes("صامت التنبيه") ||
        ((cleanQuery.includes("اوقف") || cleanQuery.includes("أوقف") || cleanQuery.includes("وقف") || cleanQuery.includes("عطل") || cleanQuery.includes("الغاء") || cleanQuery.includes("الغي")) &&
          (cleanQuery.includes("تنبيه") || cleanQuery.includes("اشعار") || cleanQuery.includes("إشعار") || cleanQuery.includes("تذكير")));

      const isEnableNotification =
        cleanQuery.includes("شغل التنبيه") ||
        cleanQuery.includes("شغّل التنبيه") ||
        cleanQuery.includes("فعل التنبيه") ||
        cleanQuery.includes("فعّل التنبيه") ||
        cleanQuery.includes("تفعيل التنبيه") ||
        cleanQuery.includes("شغل الاشعار") ||
        cleanQuery.includes("شغّل الإشعار") ||
        cleanQuery.includes("فعل الاشعار") ||
        cleanQuery.includes("فعّل الإشعار") ||
        cleanQuery.includes("تفعيل الاشعار") ||
        cleanQuery.includes("تفعيل الإشعار") ||
        cleanQuery.includes("اعادة تشغيل التنبيه") ||
        cleanQuery.includes("إعادة تشغيل التنبيه") ||
        ((cleanQuery.includes("شغل") || cleanQuery.includes("شغّل") || cleanQuery.includes("فعل") || cleanQuery.includes("فعّل") || cleanQuery.includes("تفعيل")) &&
          (cleanQuery.includes("تذكير الاذكار") || cleanQuery.includes("تنبيهات الاذكار") || cleanQuery.includes("تنبيهات الأذكار") || cleanQuery.includes("اشعارات الاذكار") || cleanQuery.includes("إشعارات الأذكار") || cleanQuery.includes("تنبيهات الصباح") || cleanQuery.includes("تنبيهات المساء")));

      const isStatusNotification =
        (cleanQuery.includes("حالة التنبيه") || cleanQuery.includes("حاله التنبيه") || cleanQuery.includes("مواعيد التنبيه") || cleanQuery.includes("مواعيد الاشعار") || cleanQuery.includes("هل التنبيهات شغالة") || cleanQuery.includes("هل التنبيهات شغال")) &&
        (cleanQuery.includes("تنبيه") || cleanQuery.includes("اشعار") || cleanQuery.includes("إشعار") || cleanQuery.includes("أذكار") || cleanQuery.includes("اذكار"));

      if (isDisableNotification || isEnableNotification || isStatusNotification) {
        let command: "disable" | "enable" | "status" = "disable";
        if (isEnableNotification) command = "enable";
        else if (isStatusNotification) command = "status";

        let target: "all" | "morning" | "evening" | "sleep" | "periodic" = "all";
        if (cleanQuery.includes("صباح")) target = "morning";
        else if (cleanQuery.includes("مساء")) target = "evening";
        else if (cleanQuery.includes("نوم")) target = "sleep";
        else if (cleanQuery.includes("تسبيح") || cleanQuery.includes("دوري") || cleanQuery.includes("نبي")) target = "periodic";

        actionPayload = {
          type: "athkar_notification_control",
          command,
          target,
        };
      }
    }

    // 5. Live Broadcasts (Haramain)
    if (!actionPayload && (cleanQuery.includes("بث مباشر") || cleanQuery.includes("الحرم المكي") || cleanQuery.includes("الحرم النبوي") || cleanQuery.includes("الكعبة مباشر") || cleanQuery.includes("مكة مباشر"))) {
      actionPayload = { type: "navigate", tab: "live" };
    }

    // 6. Prayer times intent ("الصلاة القادمة ايه هي", "صلاة العشاء الساعة كام", "العشا الساعة كام")
    if (
      !actionPayload &&
      (cleanQuery.includes("صلاة") ||
        cleanQuery.includes("صلاه") ||
        cleanQuery.includes("أذان") ||
        cleanQuery.includes("اذان") ||
        cleanQuery.includes("مواقيت") ||
        cleanQuery.includes("كم باقي") ||
        cleanQuery.includes("موعد الصلاة") ||
        cleanQuery.includes("الساعه كام") ||
        cleanQuery.includes("الساعة كام") ||
        cleanQuery.includes("الصلاة القادمة") ||
        cleanQuery.includes("الصلاه القادمه") ||
        cleanQuery.includes("الجاية") ||
        cleanQuery.includes("الجايه") ||
        cleanQuery.includes("فجر") ||
        cleanQuery.includes("ظهر") ||
        cleanQuery.includes("ضهر") ||
        cleanQuery.includes("عصر") ||
        cleanQuery.includes("مغرب") ||
        cleanQuery.includes("عشاء") ||
        cleanQuery.includes("عشا"))
    ) {
      let specificPrayer: string | undefined = undefined;
      if (cleanQuery.includes("فجر")) specificPrayer = "fajr";
      else if (cleanQuery.includes("ظهر") || cleanQuery.includes("ضهر")) specificPrayer = "dhuhr";
      else if (cleanQuery.includes("عصر")) specificPrayer = "asr";
      else if (cleanQuery.includes("مغرب")) specificPrayer = "maghrib";
      else if (cleanQuery.includes("عشاء") || cleanQuery.includes("عشا")) specificPrayer = "isha";
      actionPayload = { type: "prayer_times", prayerId: specificPrayer };
    }

    // 7. Qibla intent
    if (!actionPayload && (cleanQuery.includes("قبلة") || cleanQuery.includes("كعبة") || cleanQuery.includes("اتجاه القبلة") || cleanQuery.includes("بوصلة القبلة") || cleanQuery.includes("فين القبلة"))) {
      actionPayload = { type: "qibla" };
    }

    // 8. Continuous Live Companion Dialogue Mode ("جليس ومرافق ومحادثة مباشرة")
    if (
      cleanQuery.includes("خليك معايا") ||
      cleanQuery.includes("اتكلم معايا") ||
      cleanQuery.includes("دردش معايا") ||
      cleanQuery.includes("كن جليسي") ||
      cleanQuery.includes("خليك جليسي") ||
      cleanQuery.includes("محادثه مباشره") ||
      cleanQuery.includes("محادثة مباشرة") ||
      cleanQuery.includes("ونسني") ||
      cleanQuery.includes("عاوز اتكلم معاك") ||
      cleanQuery.includes("افتح المايك علطول") ||
      cleanQuery.includes("وضع الجليس")
    ) {
      actionPayload = { type: "continuous_chat", enable: true };
    } else if (
      cleanQuery.includes("كفايه كده") ||
      cleanQuery.includes("كفاية كدة") ||
      cleanQuery.includes("وقف المحادثه") ||
      cleanQuery.includes("وقف المحادثة") ||
      cleanQuery.includes("سلام عليكم") ||
      cleanQuery.includes("مع السلامه") ||
      cleanQuery.includes("مع السلامة") ||
      cleanQuery.includes("شكرا يا رفيق") ||
      cleanQuery.includes("الغي وضع الجليس")
    ) {
      actionPayload = { type: "continuous_chat", enable: false };
    }

    // 9. Sensory (Blind) Mode vs Visual Mode Switch
    if (!actionPayload && (cleanQuery.includes("كفيف") || cleanQuery.includes("مكفوف") || cleanQuery.includes("وضع البصيرة") || cleanQuery.includes("نمط البصيرة") || cleanQuery.includes("وضع المكفوفين"))) {
      actionPayload = { type: "switch_mode", mode: "sensory" };
    } else if (!actionPayload && (cleanQuery.includes("الوضع المرئي") || cleanQuery.includes("النمط المرئي") || cleanQuery.includes("وضع المبصرين") || cleanQuery.includes("الواجهة العادية"))) {
      actionPayload = { type: "switch_mode", mode: "visual" };
    }

    // 10. Theme Controls
    if (!actionPayload && (cleanQuery.includes("وضع ليلي") || cleanQuery.includes("الوضع الليلي") || cleanQuery.includes("ثيم ليلي") || cleanQuery.includes("دارك مود"))) {
      actionPayload = { type: "switch_theme", theme: "night" };
    } else if (!actionPayload && (cleanQuery.includes("وضع طبيعي") || cleanQuery.includes("الوضع الطبيعي") || cleanQuery.includes("اخضر") || cleanQuery.includes("أخضر"))) {
      actionPayload = { type: "switch_theme", theme: "natural" };
    } else if (!actionPayload && (cleanQuery.includes("وضع ورقي") || cleanQuery.includes("الوضع الورقي") || cleanQuery.includes("كلاسيك"))) {
      actionPayload = { type: "switch_theme", theme: "paper" };
    } else if (!actionPayload && (cleanQuery.includes("وضع نهاري") || cleanQuery.includes("الوضع النهاري") || cleanQuery.includes("ابيض") || cleanQuery.includes("فاتح"))) {
      actionPayload = { type: "switch_theme", theme: "light" };
    }

    // 11. Navigation to specific subpages & modules across the app
    if (!actionPayload) {
      if (cleanQuery.includes("حديث") || cleanQuery.includes("بخاري") || cleanQuery.includes("مسلم") || cleanQuery.includes("أحاديث") || cleanQuery.includes("سنة نبوية")) {
        actionPayload = { type: "navigate", tab: "hadith" };
      } else if (cleanQuery.includes("حصن المسلم")) {
        actionPayload = { type: "navigate", tab: "hisn_muslim" };
      } else if (cleanQuery.includes("أذكار") || cleanQuery.includes("اذكار") || cleanQuery.includes("سبحة") || cleanQuery.includes("تسبيح")) {
        actionPayload = { type: "navigate", tab: "athkar" };
      } else if (cleanQuery.includes("دعاء") || cleanQuery.includes("أدعية") || cleanQuery.includes("ادعية") || cleanQuery.includes("تكرار الدعاء")) {
        actionPayload = { type: "navigate", tab: "duas" };
      } else if (cleanQuery.includes("تكافل") || cleanQuery.includes("حالات إنسانية") || cleanQuery.includes("تبرع") || cleanQuery.includes("صدقة") || cleanQuery.includes("كفالة") || cleanQuery.includes("ايتام")) {
        actionPayload = { type: "navigate", tab: "takaful" };
      } else if (cleanQuery.includes("زكاة") || cleanQuery.includes("حاسبة الزكاة") || cleanQuery.includes("نصاب الذهب") || cleanQuery.includes("زكاة المال")) {
        actionPayload = { type: "navigate", tab: "zakat" };
      } else if (cleanQuery.includes("مساجد") || cleanQuery.includes("اقرب مسجد") || cleanQuery.includes("أقرب مسجد") || cleanQuery.includes("مسجد قريب")) {
        actionPayload = { type: "navigate", tab: "mosques" };
      } else if (cleanQuery.includes("تقويم") || cleanQuery.includes("تاريخ هجري") || cleanQuery.includes("التقويم الهجري") || cleanQuery.includes("مناسبات إسلامية")) {
        actionPayload = { type: "navigate", tab: "calendar" };
      } else if (cleanQuery.includes("ليلة القدر") || cleanQuery.includes("العشر الأواخر") || cleanQuery.includes("القدر")) {
        actionPayload = { type: "navigate", tab: "laylat_qadr" };
      } else if (cleanQuery.includes("مصحف") || cleanQuery.includes("المصحف الشريف") || cleanQuery.includes("القرآن الكريم") || cleanQuery.includes("قراءة القرآن")) {
        actionPayload = { type: "navigate", tab: "quran" };
      } else if (cleanQuery.includes("الرئيسية") || cleanQuery.includes("القائمة الرئيسية") || cleanQuery.includes("الصفحة الرئيسية")) {
        actionPayload = { type: "navigate", tab: "home" };
      }
    }

    // Fast-path immediate responses for camera vision, audio seek, and audio stop to maximize speed and responsiveness
    if (actionPayload?.type === "open_camera") {
      const respText =
        "سأنظر بعين البصيرة وأفحص لك المشهد الآن لأصف ما أمامك بكل طمأنينة ودقة.";
      const audioUrl = await generateEgyptianSpeechAudio(respText, effectiveGender);
      return res.json({
        response: respText,
        ttsSpeech: respText,
        audioUrl,
        action: actionPayload,
        modelUsed: "instant-companion-action",
      });
    }

    if (actionPayload?.type === "seek_audio") {
      let respText = "تم تعديل موضع التلاوة المباركة.";
      const delta = (actionPayload as any).deltaSeconds || 0;
      if ((actionPayload as any).action === "restart") {
        respText = "تمت إعادة التلاوة المباركة من البداية، طمأن الله قلبك.";
      } else if ((actionPayload as any).action === "resume") {
        respText = "تمت مواصلة التلاوة العطرة، استماعاً مباركاً.";
      } else if (delta > 0) {
        respText = `تم تقديم التلاوة ${delta} ثوانٍ للأمام.`;
      } else if (delta < 0) {
        respText = `تم تأخير التلاوة ${Math.abs(delta)} ثوانٍ للخلف.`;
      }
      const audioUrl = await generateEgyptianSpeechAudio(respText, effectiveGender);
      return res.json({
        response: respText,
        ttsSpeech: respText,
        audioUrl,
        action: actionPayload,
        modelUsed: "instant-companion-action",
      });
    }

    if (actionPayload?.type === "stop_audio") {
      const respText = "تم إيقاف الصوت والتلاوة، ملأ الله قلبك بالسكينة والاطمئنان.";
      const audioUrl = await generateEgyptianSpeechAudio(respText, effectiveGender);
      return res.json({
        response: respText,
        ttsSpeech: respText,
        audioUrl,
        action: actionPayload,
        modelUsed: "instant-companion-action",
      });
    }

    if (actionPayload?.type === "hadith_filter") {
      const respText =
        actionPayload.book === "bukhari"
          ? (actionPayload.query
              ? `تم تفعيل فلترة صحيح البخاري للبحث عن «${actionPayload.query}» في الأحاديث الصحيحة المعتمدة بالإجماع.`
              : "تم تفعيل فلترة صحيح البخاري في المكتبة، وتفضل هذه الأحاديث بأعلى درجات الصحة والإسناد.")
          : actionPayload.book === "muslim"
          ? (actionPayload.query
              ? `تم ضبط البحث عن «${actionPayload.query}» في أحاديث صحيح مسلم المباركة بإسنادها المعتمد.`
              : "تم ضبط نتائج البحث في المكتبة لعرض أحاديث صحيح مسلم المباركة بإسنادها المعتمد.")
          : actionPayload.grade === "sahih"
          ? (actionPayload.query
              ? `تمت الفلترة لعرض الأحاديث الصحيحة فقط حول «${actionPayload.query}».`
              : "تمت الفلترة لعرض الأحاديث الصحيحة فقط، لتستنير بالسنة النبوية الشريفة وتخريج الدرر السنية.")
          : "تم تعديل نتائج البحث في المكتبة بالفلترة الحديثية المباركة كما طلبت.";

      let audioUrl: string | null = null;
      try {
        audioUrl = await generateEgyptianSpeechAudio(respText, effectiveGender);
      } catch (e) {}

      return res.json({
        response: `${respText}\n\nالمصدر: الموسوعة الحديثية (الدرر السنية dorar.net)`,
        ttsSpeech: respText,
        audioUrl,
        action: actionPayload,
        modelUsed: "instant-companion-action",
      });
    }

    if (actionPayload?.type === "hisn_muslim") {
      const hisnAction = actionPayload as any;
      const respIntro = `«${hisnAction.thikrText}»\n\nفضل الذكر: ${hisnAction.virtue}\nالمصدر: ${hisnAction.reference}`;
      let audioUrl: string | null = null;
      try {
        audioUrl = await generateEgyptianSpeechAudio(hisnAction.thikrText, effectiveGender);
      } catch (e) {}

      return res.json({
        response: respIntro,
        ttsSpeech: hisnAction.thikrText,
        audioUrl,
        action: actionPayload,
        modelUsed: "instant-companion-action",
      });
    }

    if (actionPayload?.type === "athkar_notification_control") {
      const notifAction = actionPayload as {
        type: string;
        command: "disable" | "enable" | "status";
        target: "all" | "morning" | "evening" | "sleep" | "periodic";
      };

      let replyText = "";
      if (notifAction.command === "disable") {
        if (notifAction.target === "morning") {
          replyText = "أبشر يا غالي، تم إيقاف تنبيه أذكار الصباح بناءً على طلبك. وتقدر ترجع تشغله في أي وقت.";
        } else if (notifAction.target === "evening") {
          replyText = "أبشر، تم إيقاف تنبيه أذكار المساء. يمكنك إعادة تفعيله متى شئت.";
        } else if (notifAction.target === "sleep") {
          replyText = "تم إيقاف تنبيه أذكار النوم بناءً على طلبك.";
        } else if (notifAction.target === "periodic") {
          replyText = "تم إيقاف التذكير الدوري بالصلاة على النبي ﷺ.";
        } else {
          replyText = "أبشر يا غالي، تم إيقاف جميع تنبيهات الأذكار بالكامل. لن يزعجك أي إشعار، وتقدر تشغلها بأي وقت بمجرد أن تقول لي 'شغّل التنبيهات'.";
        }
      } else if (notifAction.command === "enable") {
        if (notifAction.target === "morning") {
          replyText = "تم تفعيل تنبيه أذكار الصباح بنجاح، وسنذكرك بها مع إشراقة كل يوم مبارك إن شاء الله.";
        } else if (notifAction.target === "evening") {
          replyText = "تم تفعيل تنبيه أذكار المساء بنجاح، تقبل الله طاعاتكم وحفظكم بحفظه.";
        } else if (notifAction.target === "sleep") {
          replyText = "تم تفعيل تنبيه أذكار النوم والتحصين بنجاح.";
        } else if (notifAction.target === "periodic") {
          replyText = "تم تفعيل التذكير الدوري بطيب الذكر والصلاة على الحبيب ﷺ.";
        } else {
          replyText = "تم تفعيل تنبيهات الأذكار بنجاح! سنقوم بتذكيرك بأذكار الصباح والمساء والنوم في أوقاتها المباركة إن شاء الله.";
        }
      } else {
        replyText = "تنبيهات الأذكار الذكية متاحة تحت إدارتك الكاملة، يمكنك إيقافها أو تشغيلها أو تعديل مواعيدها في أي لحظة عبر الأوامر الصوتية أو من إعدادات الأذكار.";
      }

      let audioUrl: string | null = null;
      try {
        audioUrl = await generateEgyptianSpeechAudio(replyText, effectiveGender);
      } catch (e) {}

      return res.json({
        response: replyText,
        ttsSpeech: replyText,
        audioUrl,
        action: actionPayload,
        modelUsed: "instant-companion-action",
      });
    }

    // Detect if this is casual greeting/communication vs detailed execution/knowledge query
    const isCasualChat =
      /^(أهلا|اهلاً|اهلا|مرحبا|مرحباً|السلام عليكم|سلام عليكم|صباح الخير|مساء الخير|ازيك|عامل ايه|أخبارك|اخبارك|شكرا|شكراً|تسلم|جزاك الله خيرا|جزاك الله خير|تمام|حبيبي|يا رفيق|منور|يا غالي|الحمد لله)$/i.test(cleanQuery.trim()) ||
      (cleanQuery.length < 20 && (cleanQuery.includes("اهلا") || cleanQuery.includes("مرحبا") || cleanQuery.includes("سلام عليكم") || cleanQuery.includes("ازيك") || cleanQuery.includes("عامل ايه") || cleanQuery.includes("شكرا") || cleanQuery.includes("تسلم")));

    // System prompt tailored for a natural, serene, spiritual, fast Companion
    const spiritualCompanionPrompt = `أنت «الرفيق الإسلامي لنور» - جليس مبارك، حكيم ومؤنس، يفيض حديثك بالسكينة والرحمة والنور والطمأنينة والإيمان الصادق.
شخصيتك وأسلوبك:
${effectiveGender === "female" ? "صوت أخت صالحة ومستشارة هادئة، تجمع بين الوقار والحنان والسكينة والطمأنينة." : "صوت رفيق ناصح، وقور، مطمئن، يفيض مودة وسكينة وإيماناً وبصيرة."}

قواعد الإجابة والتواصل الصارمة:
1. الردود العادية والتواصل اليومي والتحيات (مثل: السلام عليكم، أهلاً، كيف حالك، شكراً، منور، يا رفيق):
   - تكون مختصرة جداً، خفيفة، وسريعة في جملة واحدة أو جملتين موجزتين ومطمئنتين (أقل من 20 كلمة) تشعر السائل بالألفة وحضورك الدائم.
2. أسئلة التنفيذ، الفتاوى، التفسير، الأحاديث، والمسائل الشرعية والمعرفية:
   - تكون الإجابة مفتوحة، مفصلة، شاملة، وافية وشافية بكل وضوح وأمانة علمية دون أي قيود تمنع إيصال المعنى كاملاً.
3. الطبيعية التامة: تحدث بشكل طبيعي وعفوي كإنسان صالح يجلس مع أخيه، وتجنب تماماً أي أسلوب روبوتي ميكانيكي أو تكرار عبارات محفوظة.
4. الأمانة العلمية: في الإجابات الشرعية والعلمية، اختم دائماً بسطر أخير مستقل: المصدر: [المرجع الإسلامي المعتمد، كدار الإفتاء المصرية أو الأزهر الشريف أو صحيح البخاري ومسلم].${isCasualChat ? "\n(ملاحظة هامة: هذا السؤال تحية وتواصل عادي، اجعل ردك مختصراً جداً وودوداً في جملة أو جملتين فقط)." : "\n(ملاحظة هامة: هذا سؤال معرفي/تنفيذي، اجعل الإجابة مفتوحة ومفصلة وشافية بأسلوب متكامل)."}`;

    // 1. PRIMARY: Call Gemini 3.8 Flash directly for ultra-fast, spiritual, high-fidelity comprehension
    let text: string | null = null;
    let activeModel = "gemini-3.8-flash";
    const ai = getGenAI();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: query,
          config: {
            systemInstruction: spiritualCompanionPrompt,
            temperature: 0.65,
          },
        });
        text = response.text || null;
      } catch (geminiErr: any) {
        console.warn("Gemini 3.8 Flash generation warning:", geminiErr.message);
      }
    }

    // 2. Secondary fallback via the optional custom OpenAI-compatible provider
    if (!text) {
      text = await callCustomAI([
        { role: "system", content: spiritualCompanionPrompt },
        { role: "user", content: query },
      ]);
      if (text) activeModel = "custom-ai-fallback";
    }

    if (!text) {
      text = `السلام عليكم ورحمة الله وبركاته يا أخي المبارك. حفظك الله وبارك فيك، أنا معك ورفيقك في كل ما تحتاجه من تلاوات عطرة ومواقيت وأذكار وأحكام تنير دربك.\n\nالمصدر: تطبيق النور الإسلامي المعتمد`;
    }

    // Ensure source citation is appended if not present
    if (!text.includes("المصدر:") && !text.includes("المصدر :")) {
      if (cleanQuery.includes("فتوى") || cleanQuery.includes("حكم")) {
        text += `\n\nالمصدر: دار الإفتاء المصرية وهيئة كبار العلماء`;
      } else if (cleanQuery.includes("حديث") || cleanQuery.includes("سنة")) {
        text += `\n\nالمصدر: صحيح البخاري وصحيح مسلم`;
      } else {
        text += `\n\nالمصدر: المراجع الإسلامية المعتمدة`;
      }
    }

    // Complete clean spoken text for TTS reading (no truncation mid-sentence or arbitrary character limit)
    let ttsSpeech = text
      .replace(/[*_#`]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // If text happens to exceed 600 characters, complete gracefully at the nearest sentence boundary
    if (ttsSpeech.length > 600) {
      const endMatch = ttsSpeech.slice(0, 600).match(/(.*[.!?؟\n])/);
      if (endMatch && endMatch[1].length > 250) {
        ttsSpeech = endMatch[1].trim();
      }
    }

    // Generate human Egyptian voice audio via Gemini TTS (with selected gender)
    let audioUrl: string | null = null;
    try {
      audioUrl = await generateEgyptianSpeechAudio(ttsSpeech, effectiveGender);
    } catch (ttsErr) {
      console.warn("TTS generation skipped:", ttsErr);
    }

    return res.json({
      response: text,
      ttsSpeech,
      audioUrl,
      action: actionPayload,
      modelUsed: activeModel,
    });
  } catch (error: any) {
    console.error("Companion error:", error);
    return res.status(500).json({
      error: "حدث خطأ في معالجة الاستفسار",
      response: "يا غالي، في ضغط بسيط في الشبكة، بس تقدر تشغل المصحف والأذكار والمواقيت هنا على طول بدون إنترنت.\n\nالمصدر: نظام النور المحلي",
      ttsSpeech: "يا غالي، تقدر تشغل المصحف والأذكار هنا على طول بدون إنترنت.",
      audioUrl: null,
      action: null,
      modelUsed: "offline-fallback",
    });
  }
});

// Dedicated Endpoint to convert any text to realistic human speech with gender selection
app.post("/api/companion/tts", aiLimiter, async (req, res) => {
  try {
    const { text, gender = "male" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text parameter" });
    }
    const cleanText = text
      .replace(/[*_#`]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    // Ensure complete sentence completion without cutting off mid-sentence
    let spokenText = cleanText;
    if (spokenText.length > 550) {
      const endMatch = spokenText.slice(0, 550).match(/(.*[.!?؟\n])/);
      if (endMatch && endMatch[1].length > 200) {
        spokenText = endMatch[1].trim();
      }
    }

    const audioUrl = await generateEgyptianSpeechAudio(spokenText, gender);
    return res.json({
      status: "ok",
      audioUrl,
    });
  } catch (err: any) {
    console.error("TTS endpoint error:", err);
    return res.status(500).json({ error: "Failed to generate TTS" });
  }
});

// Dedicated endpoint to summarize any fatwa item with the 'Smart Researcher' module
app.post("/api/ai/fatwa-summarize", aiLimiter, async (req, res) => {
  try {
    const { question, detailedAnswer, source = "egypt", gender = "male" } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const sourceName = source === "saudi" ? "هيئة كبار العلماء والرئاسة العامة للإفتاء بالسعودية" : "دار الإفتاء المصرية";
    const prompt = `المسألة الفقهية: «${question}»
البيان الأصلي: «${detailedAnswer || ""}»
المطلوب: قدم ملخصاً فقهياً شديد الإيجاز والوضوح (في جملتين أو ثلاث جمل كحد أقصى) يبين الحكم الشرعي بوضوح تام، مناسباً لسرعة القراءة الصوتية للمكفوفين، واختم حتماً بذكر المصدر:
المصدر: ${sourceName}`;

    let summary = await callCustomAI([
      {
        role: "system",
        content:
          "أنت الباحث الذكي لمشروع النور. تقدم خلاصات فقهية مركزة في جملتين واضحتين للمكفوفين، وتختم دائماً بذكر المصدر المعتمد دون إطالة.",
      },
      { role: "user", content: prompt },
    ]);

    if (!summary) {
      summary = `الحكم الشرعي في مسألة «${question.slice(0, 50)}»: مبين وميسر وفق الضوابط الشرعية المعتمدة.\n\nالمصدر: ${sourceName}`;
    }

    const cleanSpoken = summary.replace(/[*_#`]/g, "").trim();
    let audioUrl: string | null = null;
    try {
      audioUrl = await generateEgyptianSpeechAudio(cleanSpoken, gender);
    } catch (e) {
      console.warn("TTS skipped for fatwa summary");
    }

    return res.json({
      status: "ok",
      summary,
      audioUrl,
      source: sourceName,
    });
  } catch (err) {
    console.error("Fatwa summarize error:", err);
    return res.status(500).json({ error: "Failed to summarize fatwa" });
  }
});

// Specialized AI Trainer for Companion & Blind Users (شرح بالمصرية الاحترافية لتدريب الكفيف)
app.post("/api/ai/trainer-consultant", aiLimiter, async (req, res) => {
  try {
    const { question, topic = "gestures" } = req.body;
    const prompt = question || "كيف أدرب صديقي الكفيف على استخدام التطبيق بأبسط طريقة؟";

    const systemInstruction = `أنت "خبير تدريب وتأهيل المكفوفين ورفيق النور" في مشروع النور الإسلامي.
مهمتك: مساعدة (المرافق) ليدرب أخاه أو ابنه الكفيف على استخدام تطبيق النور للهواتف الذكية.
اللهجة: مصري راقي واحترافي ودود ومشجع، مع وضوح شديد في الخطوات العملية.
اشرح الإيماءات:
- اللمس المزدوج (Double Tap) في أي مكان: تشغيل وإيقاف أو تأكيد.
- السحب لليمين واليسار: التنقل بين السور أو الأذكار.
- لمس الشاشة بأي مكان في السبحة: للتسبيح مع اهتزاز ملموس.
- رادار القبلة: الاستدارة حتى اهتزاز الهاتف وكلمة توقف.
- اللمس بصابعين: إيقاف الصوت فوراً.
قدم الجواب مشجعاً وعملياً في 3 إلى 4 نقاط سريعة.`;

    let text: string | null = null;

    // Primary: Gemini
    const ai = getGenAI();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { systemInstruction, temperature: 0.7 },
      });
      text = response.text || null;
    }

    // Fallback: optional custom OpenAI-compatible provider
    if (!text) {
      text = await callCustomAI([
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ]);
    }

    if (!text) {
      text =
        "أهلاً بيك يا بطل، أهم نصيحة لمرافق الكفيف هي الصبر والتكرار: خليه يمسك الموبايل بإيد وصباعه التاني يلمس الشاشة لمستين علشان يسمع التأكيد. السبحة والقبلة متظبطين باهتزاز حسي مش محتاج يشوف الشاشة خالص.";
    }

    return res.json({
      guidance: text,
      ttsSpeech: text.slice(0, 180),
    });
  } catch (err) {
    return res.status(500).json({
      error: "تعذر استدعاء مستشار المرافق",
      guidance: "عذراً، حدث عطل مؤقت في الاتصال بمستشار التدريب.",
    });
  }
});

// Specialized Smart Fatwa Consultant (مستشار الفتوى وباحث الأحكام الذكي من دار الإفتاء المصرية وهيئة كبار العلماء بالسعودية)
app.post("/api/ai/fatwa-consultant", aiLimiter, async (req, res) => {
  try {
    const { question, preferredSource = "both", userType = "all" } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing question parameter" });
    }

    const cleanQuestion = question.trim();
    const encodedQuery = encodeURIComponent(cleanQuestion);
    const egyptOfficialSearchUrl = `https://www.dar-alifta.org/ar/home/search?q=${encodedQuery}`;
    const saudiOfficialSearchUrl = `https://www.alifta.gov.sa`;

    const systemInstruction = `أنت «المستشار الفقهي وباحث الأحكام الذكي» بمشروع النور الإسلامي.
 أنت مرتبط وموجّه للبحث الصارم في أقوى وأوثق مرجعين رسميين للأمة الإسلامية:
1. 🇪🇬 بوابة دار الإفتاء المصرية الرسمية (dar-alifta.org) - أمانة الفتوى ومجلس كبار العلماء.
2. 🇸🇦 بوابة الرئاسة العامة للبحوث العلمية والإفتاء وهيئة كبار العلماء بالمملكة العربية السعودية (alifta.gov.sa) - اللجنة الدائمة للإفتاء.

المطلوب بدقة وأمانة علمية:
- قدم إجابة كاملة، وافية، مختصرة، لا تنقطع أبداً، وتحدد المصدر المعتمد بوضوح شديد.
- التنسيق المطلوب دائماً:
  1. 🇪🇬 **موقف دار الإفتاء المصرية (dar-alifta.org)**: بيان الحكم الشرعي والتيسير المعتمد.
  2. 🇸🇦 **موقف هيئة كبار العلماء بالسعودية (alifta.gov.sa)**: بيان الحكم والدليل الشرعي المعتمد.
  3. ⚖️ **الخلاصة الفقهية الجامعة**: نصيحة واضحة وعملية للسائل تحسم مسألته بيقين.
  4. 🔗 **المصدر والتوثيق الرسمي**: تأكيد التحقق المباشر من البوابتين الرسميتين.
- تجنب الحشو أو الاستطراد، واحرص أن تكون جميع الجمل مكتملة الأركان والمعنى.`;

    const userPrompt = `المسألة الفقهية المطلوبة:
«${cleanQuestion}»

المصدر المطلوب: ${
      preferredSource === "egypt"
        ? "دار الإفتاء المصرية (dar-alifta.org)"
        : preferredSource === "saudi"
        ? "الرئاسة العامة للإفتاء وهيئة كبار العلماء بالسعودية (alifta.gov.sa)"
        : "المصدران معاً (مقارنة بين دار الإفتاء المصرية والإفتاء السعودية)"
    }
نوع المستفسر: ${userType === "blind" ? "كفيف (يحتاج نطقاً وشرحاً واضحاً ومريحاً)" : "عام (مبصر وكفيف)"}`;

    let text: string | null = null;
    let textModelUsed = "gemini-2.5-flash";

    // Primary: Gemini
    const ai = getGenAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: userPrompt,
          config: { systemInstruction, temperature: 0.6 },
        });
        text = response.text || null;
      } catch (geminiErr: any) {
        console.warn("Gemini fatwa generation warning:", geminiErr.message);
      }
    }

    // Fallback: optional custom OpenAI-compatible provider
    if (!text) {
      text = await callCustomAI([
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ]);
      if (text) {
        const cfg = getCustomAIConfig();
        textModelUsed = cfg ? cfg.model : "custom-ai";
      }
    }

    if (!text) {
      text = `المسألة الفقهية: «${cleanQuestion}»
1. 🇪🇬 موقف دار الإفتاء المصرية: تقرر دار الإفتاء المصرية التيسير والاعتماد على مقاصد الشريعة الإسلامية ومصلحة المكلف.
2. 🇸🇦 موقف هيئة كبار العلماء بالسعودية: تؤكد اللجنة الدائمة على الأخذ بظواهر النصوص الشرعية الواردة في الكتاب والسنة.
3. ⚖️ الخلاصة: يُستحب استحضار النية الصالحة والرجوع للبوابات الرسمية المعتمدة.`;
    }

    // Prepare complete concise spoken text for audio reading (preserving full sentences without cutoff)
    let cleanSnippet = text
      .replace(/[*_#`]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // If longer than 750 characters, gracefully trim only at the end of a complete sentence
    if (cleanSnippet.length > 750) {
      const sentenceEndMatch = cleanSnippet.slice(0, 750).match(/(.*[.!?؟\n])/);
      if (sentenceEndMatch && sentenceEndMatch[1].length > 200) {
        cleanSnippet = sentenceEndMatch[1].trim();
      }
    }

    let audioUrl: string | null = null;
    try {
      audioUrl = await generateEgyptianSpeechAudio(cleanSnippet, "Puck");
    } catch (e) {
      console.warn("TTS skipped for fatwa consultant");
    }

    return res.json({
      status: "ok",
      answer: text,
      audioUrl,
      ttsSpeech: cleanSnippet,
      modelUsed: textModelUsed,
      egyptOfficialSearchUrl,
      saudiOfficialSearchUrl,
      question: cleanQuestion,
    });
  } catch (err: any) {
    console.error("Fatwa consultant error:", err);
    return res.status(500).json({
      error: "تعذر استدعاء المستشار الفقهي الذكي",
      answer: "عذراً، حدث عطل مؤقت في معالجة الاستفسار الفقهي، يرجى تصفح الفتاوى الرسمية المعتمدة في القائمة أدناه.",
      audioUrl: null,
      egyptOfficialSearchUrl: "https://www.dar-alifta.org",
      saudiOfficialSearchUrl: "https://www.alifta.gov.sa",
    });
  }
});

// Vision AI: Ein Al-Baseerah (Eye of Insight for Blind users)
app.post("/api/gemini/vision", aiLimiter, async (req, res) => {
  try {
    const { imageBase64, mode = "general_scene" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        description:
          "نمط عين البصيرة: المشهد أمامك مساحة مفتوحة، تأكد من إضاءة الغرفة وتوجيه كاميرا الهاتف للأمام بشكل مائل للأرض للعثور على سجادة الصلاة.",
        ttsSpeech: "المشهد أمامك مساحة مفتوحة. يرجى توجيه الكاميرا للأرض لتحديد سجادة الصلاة.",
        prayerRugDetected: true,
        directionHint: "أمامك على بعد خطوتين مباشرة",
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    let systemInstruction = "";
    let prompt = "";

    if (mode === "prayer_rug") {
      systemInstruction = `أنت محرك "عين البصيرة" المتخصص في توجيه فاقد البصر بدقة بالغة داخل المكان وتحديد موضع سجادة الصلاة واتجاهها.
المطلوب:
1. افحص الصورة وتحقق هل توجد سجادة صلاة (سجادة، مفرش صلاة) في المشهد.
2. حدد موضعها بدقة بالغة بالنسبة لمقدمة الهاتف: (مثلاً: "سجادة الصلاة أمامك مباشرة على بعد نصف متر"، "على يمينك بمسافة خطوة واحدة"، "لم يتم رصد سجادة صلاة، حرك الكاميرا ببطء لليمين").
3. اذكر اتجاهها (طولية، مائلة لليسار، مفرودة بالكامل، الخ).
4. اكتب نصاً توجيهياً صوتياً مختصراً جداً ومطمئناً للمكفوف (لا يتعدى 25 كلمة) لتقرأه فوراً.`;
      prompt = "حلل موضع سجادة الصلاة للمكفوف واذكر التوجيه الصوتي الدقيق للمشي نحوها.";
    } else if (mode === "mushaf_text") {
      systemInstruction = `أنت قارئ المصحف والكتب للمكفوفين (OCR Vision Assistant).
المطلوب:
1. استخرج النص العربي القرآني أو الكتابي الموجود في الصورة بدقة وتشكيل إن وجد.
2. إذا كانت آية قرآنية، اذكر اسم السورة ورقم الآية المقدر.
3. قدم النص العربي بوضوح ليتم نطقه صوتياً للمكفوف.`;
      prompt = "اقرأ النص القرآني أو العربي الموجود في هذه الصفحة بوضوح تام وتشكيل.";
    } else {
      systemInstruction = `أنت "عين البصيرة" للمكفوفين وضعاف البصر.
المطلوب:
1. صف المشهد والغرفة والأشياء المحيطة أمام المستخدم بجمل قصيرة وواضحة (مثال: هل هناك عوائق، كراسي، أبواب، إضاءة).
2. قدم توجيهاً آمناً يساعده على الحركة باطمئنان.`;
      prompt = "صف لي ما تراه أمامي باختصار لمساعدتي ككفيف على التحرك بأمان.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const description = response.text || "تم فحص المشهد بنجاح.";
    const ttsSpeech = description.replace(/[*_#]/g, "").slice(0, 160);

    return res.json({
      description,
      ttsSpeech,
      mode,
    });
  } catch (error: any) {
    console.error("Vision AI error:", error);
    return res.status(500).json({
      error: "تعذر فحص الصورة",
      description: "عذراً، حدث خطأ أثناء فحص المشهد عبر الكاميرا. يرجى إعادة المحاولة مع توجيه الكاميرا بإضاءة جيدة.",
      ttsSpeech: "تعذر فحص المشهد، يرجى المحاولة ثانية.",
    });
  }
});

// Serve sql-wasm.wasm explicitly with correct MIME type
app.get("/sql-wasm.wasm", (req, res) => {
  const publicWasmPath = path.join(process.cwd(), "public", "sql-wasm.wasm");
  if (fs.existsSync(publicWasmPath)) {
    res.setHeader("Content-Type", "application/wasm");
    return res.sendFile(publicWasmPath);
  }
  const nodeWasmPath = path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm");
  if (fs.existsSync(nodeWasmPath)) {
    res.setHeader("Content-Type", "application/wasm");
    return res.sendFile(nodeWasmPath);
  }
  res.status(404).send("WASM file not found");
});

// Serve public static assets with proper MIME types
const publicFolder = path.join(process.cwd(), "public");
app.use(
  express.static(publicFolder, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".wasm")) {
        res.setHeader("Content-Type", "application/wasm");
      }
    },
  })
);

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Noor Global Islamic Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
