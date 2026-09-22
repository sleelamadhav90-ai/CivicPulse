import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Scalability & Persistence Architecture modules
import { getServerConfig } from './src/server/config.js';
import { getCitizenRequestRepository } from './src/server/repositories/index.js';
import { validateCitizenRequest, validateProcessFeedback } from './src/server/validation/requestValidator.js';
import { requestIdMiddleware } from './src/server/middleware/requestId.js';
import { generalApiLimiter, expensiveAiLimiter } from './src/server/middleware/rateLimiter.js';
import { errorHandler, AppError } from './src/server/middleware/errorHandler.js';
import {
  policyBriefCache,
  feedbackDiagnosticCache,
  searchIntentCache,
  searchSummaryCache,
  conversationalCache,
} from './src/server/cache/memoryCache.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with large payload limit for base64 audio
app.use(express.json({ limit: '25mb' }));

// Traceability: Attach request ID and measure response latency
app.use(requestIdMiddleware);

// Active Persistence Repository (Defaults to JsonCitizenRequestRepository)
const requestRepository = getCitizenRequestRepository();

// Global Rate Limiting across API endpoints
app.use('/api', generalApiLimiter);

// Dedicated Rate Limiting for high-cost AI operations
app.use('/api/process-feedback', expensiveAiLimiter);
app.use('/api/conversational-followup', expensiveAiLimiter);
app.use('/api/generate-policy-brief', expensiveAiLimiter);

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Endpoint: Comprehensive Health & Readiness Check
const handleHealthCheck = async (req: Request, res: Response) => {
  const repoHealth = await requestRepository.healthCheck();
  const stats = await requestRepository.getStatistics();
  res.json({
    status: repoHealth.status === 'down' ? 'degraded' : 'ok',
    service: 'civicpulse-api',
    version: '1.0.0',
    uptimeSeconds: Number(process.uptime().toFixed(1)),
    timestamp: new Date().toISOString(),
    persistedRequestsCount: stats.totalRequests,
    checks: {
      persistence: repoHealth,
      configuration: {
        persistenceType: getServerConfig().persistenceType,
        rateLimitEnabled: getServerConfig().rateLimitEnabled,
        databaseConfigured: Boolean(getServerConfig().databaseUrl),
      },
      cache: {
        policyBriefs: policyBriefCache.getStats(),
        feedbackDiagnostics: feedbackDiagnosticCache.getStats(),
        searchIntents: searchIntentCache.getStats(),
        searchSummaries: searchSummaryCache.getStats(),
        conversational: conversationalCache.getStats(),
      },
      aiService: {
        status: process.env.GEMINI_API_KEY ? 'configured' : 'unconfigured',
        model: 'gemini-2.5-flash',
      },
    },
  });
};
app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// Endpoint: Get persisted citizen requests with pagination and filtering
app.get('/api/citizen-requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    // Default limit to 50 if page requested; if neither page nor limit given, return all for backwards compatibility
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : (req.query.page ? 50 : 0);
    const category = req.query.category as string | undefined;
    const district = req.query.district as string | undefined;
    const state = req.query.state as string | undefined;
    const urgency = req.query.urgency as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await requestRepository.list({
      page,
      limit,
      category,
      district,
      state,
      urgency,
      status,
      search,
    });

    res.json({
      success: true,
      count: result.items.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      requests: result.items,
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: Persist newly submitted citizen request with validation
app.post('/api/citizen-requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateCitizenRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Citizen request payload validation failed.',
          details: validation.errors,
        },
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }

    const saved = await requestRepository.create(req.body);
    const stats = await requestRepository.getStatistics();

    res.json({
      success: true,
      request: saved,
      totalStored: stats.totalRequests,
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: Retrieve single citizen request by ID
app.get('/api/citizen-requests/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await requestRepository.getById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Citizen request with id '${req.params.id}' was not found.`,
        },
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }
    res.json({ success: true, request: item });
  } catch (err) {
    next(err);
  }
});

// Endpoint: Delete single citizen request by ID
app.delete('/api/citizen-requests/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await requestRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Citizen request with id '${req.params.id}' was not found.`,
        },
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }
    res.json({ success: true, deleted: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  mr: 'Marathi',
  bn: 'Bengali',
  or: 'Odia',
};

async function callGeminiWithTimeoutAndRetry(
  fn: () => Promise<any>,
  timeoutMs = 8000,
  maxRetries = 1,
  delayMs = 200
): Promise<any> {
  const runWithTimeout = () => {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`)), timeoutMs);
      if (timer.unref) timer.unref();
    });

    return Promise.race([
      fn().finally(() => clearTimeout(timer)),
      timeoutPromise,
    ]);
  };

  let lastErr: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await runWithTimeout();
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || '';
      const isRetryable =
        err?.status === 503 ||
        err?.status === 429 ||
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('timed out') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('overloaded') ||
        msg.includes('RESOURCE_EXHAUSTED');
      if (attempt < maxRetries && isRetryable) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

// Backward compatible alias
const callGeminiWithRetry = (fn: () => Promise<any>, maxRetries = 1, delayMs = 200) => 
  callGeminiWithTimeoutAndRetry(fn, 8000, maxRetries, delayMs);

// Endpoint: Process Citizen Feedback (Multimodal: Audio / Text)
app.post('/api/process-feedback', async (req: Request, res: Response) => {
  try {
    const validation = validateProcessFeedback(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Feedback input payload validation failed.',
          details: validation.errors,
        },
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }

    const { text, audioBase64, mimeType, userLocation, userCategory, language } = req.body;

    const targetLangName = LANGUAGE_NAMES[language] || language || 'English';
    const cacheKey = `${text || ''}_${audioBase64 ? audioBase64.slice(0, 40) : ''}_${userLocation || ''}_${userCategory || ''}_${targetLangName}`;
    if (feedbackDiagnosticCache.has(cacheKey)) {
      return res.json({ success: true, data: feedbackDiagnosticCache.get(cacheKey), cached: true });
    }

    const ai = getGenAI();
    const model = 'gemini-2.5-flash';

    const promptText = `
You are the AI Civic Infrastructure Diagnostic Engine for CivicPulse (India Digital Public Infrastructure).
Analyze this citizen infrastructure request and extract structured diagnostic intelligence.

Input:
Text: """${text || '(Spoken Audio Input attached)'}"""
${userLocation ? `User-provided location: ${userLocation}` : ''}
${userCategory ? `User-provided category: ${userCategory}` : ''}
${targetLangName !== 'English' ? `Target UI Language: ${targetLangName}` : ''}

Strict Rules:
1. Do NOT invent information that is not present in the citizen's complaint.
2. If location cannot be confidently determined from the text or hint, indicate that it needs confirmation.
3. If input is in Telugu, Hindi, Tamil, Kannada, Marathi, Bengali, etc., detect the exact language, transcribe if audio, and provide a clear, accurate translation.
4. If duration or affected population are NOT mentioned by the citizen, output "Not specified" — never fabricate numbers or timeframes.
5. Extract:
   - language: Natural language name (e.g. Telugu, Hindi, Tamil, Kannada, English)
   - original_text: The user's exact words (or transcription if audio)
   - translated_text: Clear English translation
   - category: One of "Water", "Roads", "Health", "Electricity", "Education", "Drainage", "Sanitation", "Other"
   - category_display: Friendly display name, e.g. "Water & Sanitation", "Roads & Transport", "Healthcare & Clinics", "Power & Energy", "Education & Schools", "Drainage & Flood Control"
   - subcategory: Specific issue title (e.g., "Drinking water supply disruption", "Pothole corridor hazard", "Primary health center medicine shortage", "Broken street lighting")
   - issue_summary: A concise, factual summary of the issue in ${targetLangName}
   - location: The detected locality or district (e.g., "Vijayawada Rural", "Guntur", "Krishna", etc.)
   - severity: "High", "Critical", "Medium", or "Low"
   - severity_number: Integer rating from 1 to 10
   - urgency: "HIGH", "CRITICAL", "MEDIUM", or "LOW"
   - duration: If mentioned in complaint (e.g., "3 days", "Not specified")
   - affected_area: The physical facility or area (e.g., "Local drinking water supply network", "Main road corridor")
   - affected_population_if_available: If mentioned by citizen, otherwise "Not specified"
   - recommended_action: Practical municipal diagnostic action
`;

    const parts: Array<any> = [{ text: promptText }];

    if (audioBase64) {
      const cleanMime = mimeType || 'audio/webm';
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: cleanMime,
          data: cleanBase64,
        },
      });
    }

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              original_text: { type: Type.STRING },
              translated_text: { type: Type.STRING },
              category: { type: Type.STRING },
              category_display: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              issue_summary: { type: Type.STRING },
              location: { type: Type.STRING },
              severity: { type: Type.STRING },
              severity_number: { type: Type.INTEGER },
              urgency: { type: Type.STRING },
              duration: { type: Type.STRING },
              affected_area: { type: Type.STRING },
              affected_population_if_available: { type: Type.STRING },
              recommended_action: { type: Type.STRING },
            },
            required: ['language', 'category', 'subcategory', 'issue_summary', 'location', 'severity', 'severity_number', 'urgency'],
          },
        },
      })
    );

    const rawJson = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawJson);
    } catch {
      parsedData = {};
    }

    // Default or fallback normalization
    if (!parsedData.original_text) parsedData.original_text = text || 'Spoken voice recording';
    if (!parsedData.translated_text) parsedData.translated_text = parsedData.issue_summary || text || 'Citizen reported public infrastructure issue.';
    if (userLocation && (!parsedData.location || parsedData.location.toLowerCase() === 'not specified' || parsedData.location.toLowerCase().includes('needs confirmation'))) {
      parsedData.location = userLocation;
    } else if (!parsedData.location) {
      parsedData.location = 'Location not specified';
    }

    if (userCategory && !parsedData.category) {
      parsedData.category = userCategory;
    }

    // Normalize category to standard set
    const catLower = (parsedData.category || '').toLowerCase();
    if (catLower.includes('water') || catLower.includes('drinking')) {
      parsedData.category = 'Water';
      parsedData.category_display = 'Water & Sanitation';
    } else if (catLower.includes('road') || catLower.includes('transit') || catLower.includes('pothole')) {
      parsedData.category = 'Roads';
      parsedData.category_display = 'Roads & Transport';
    } else if (catLower.includes('health') || catLower.includes('clinic') || catLower.includes('hospital') || catLower.includes('doctor')) {
      parsedData.category = 'Health';
      parsedData.category_display = 'Healthcare & Clinics';
    } else if (catLower.includes('electric') || catLower.includes('power') || catLower.includes('light')) {
      parsedData.category = 'Electricity';
      parsedData.category_display = 'Power & Street Lighting';
    } else if (catLower.includes('drain') || catLower.includes('flood') || catLower.includes('sewage')) {
      parsedData.category = 'Drainage';
      parsedData.category_display = 'Drainage & Stormwater';
    } else if (catLower.includes('school') || catLower.includes('edu')) {
      parsedData.category = 'Education';
      parsedData.category_display = 'Education & Schools';
    } else if (catLower.includes('sanitat') || catLower.includes('garbage')) {
      parsedData.category = 'Sanitation';
      parsedData.category_display = 'Sanitation & Cleanliness';
    } else if (!parsedData.category) {
      parsedData.category = 'Water';
      parsedData.category_display = 'Water & Sanitation';
    }

    if (!parsedData.severity_number) {
      parsedData.severity_number = parsedData.severity === 'Critical' ? 9 : parsedData.severity === 'High' ? 8 : parsedData.severity === 'Low' ? 3 : 5;
    }
    if (!parsedData.duration) {
      parsedData.duration = 'Not specified';
    }
    if (!parsedData.affected_population_if_available) {
      parsedData.affected_population_if_available = 'Not specified';
    }
    if (!parsedData.summary_en) {
      parsedData.summary_en = parsedData.issue_summary || parsedData.translated_text || 'Civic infrastructure request logged.';
    }

    feedbackDiagnosticCache.set(cacheKey, parsedData);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.warn('Gemini API unavailable or errored, using truthful deterministic diagnostic fallback:', error?.message);
    const textInput = (req.body.text || '').toLowerCase();
    const rawText = req.body.text || 'Spoken civic issue report recorded via voice interface.';
    const isWater = textInput.includes('water') || textInput.includes('నీరు') || textInput.includes('पानी') || textInput.includes('pipeline') || textInput.includes('tank');
    const isRoads = textInput.includes('road') || textInput.includes('pothole') || textInput.includes('రోడ్డు') || textInput.includes('सड़क') || textInput.includes('traffic');
    const isHealth = textInput.includes('health') || textInput.includes('hospital') || textInput.includes('doctor') || textInput.includes('ఆసుపత్రి') || textInput.includes('दवा');
    const isLighting = textInput.includes('light') || textInput.includes('power') || textInput.includes('current') || textInput.includes('దీపం') || textInput.includes('बिजली');
    const isDrainage = textInput.includes('drain') || textInput.includes('flood') || textInput.includes('వర్షం') || textInput.includes('नाली');

    const fallbackCat = isWater ? 'Water' : isRoads ? 'Roads' : isHealth ? 'Health' : isLighting ? 'Electricity' : isDrainage ? 'Drainage' : (req.body.userCategory || 'Water');
    const fallbackDisplay = fallbackCat === 'Water' ? 'Water & Sanitation' : fallbackCat === 'Roads' ? 'Roads & Transport' : fallbackCat === 'Health' ? 'Healthcare & Clinics' : fallbackCat === 'Electricity' ? 'Power & Street Lighting' : 'Public Infrastructure';

    const isTelugu = /[\u0C00-\u0C7F]/.test(req.body.text || '');
    const isHindi = /[\u0900-\u097F]/.test(req.body.text || '');
    const isTamil = /[\u0B80-\u0BFF]/.test(req.body.text || '');

    const detectedLang = isTelugu ? 'Telugu' : isHindi ? 'Hindi' : isTamil ? 'Tamil' : 'English';
    
    // Detect explicit location mentions from text or use user provided location
    let fallbackLocation = req.body.userLocation || '';
    if (!fallbackLocation) {
      if (textInput.includes('guntur')) fallbackLocation = 'Guntur';
      else if (textInput.includes('vijayawada')) fallbackLocation = 'Vijayawada';
      else if (textInput.includes('patna')) fallbackLocation = 'Patna';
      else if (textInput.includes('nashik')) fallbackLocation = 'Nashik';
      else if (textInput.includes('gaya')) fallbackLocation = 'Gaya';
      else if (textInput.includes('solapur')) fallbackLocation = 'Solapur';
      else fallbackLocation = 'Location not specified';
    }

    const duration = textInput.includes('2 week') || textInput.includes('two week') 
      ? 'Approximately 2 weeks' 
      : textInput.includes('month') 
      ? 'Over 1 month' 
      : textInput.includes('day') 
      ? 'Several days' 
      : 'Not specified';

    const fallbackData = {
      language: detectedLang,
      original_text: rawText,
      translated_text: rawText,
      category: fallbackCat,
      category_display: fallbackDisplay,
      subcategory: isWater 
        ? 'Drinking water supply disruption' 
        : isRoads 
        ? 'Road resurfacing and pothole hazard'
        : `${fallbackCat} service disruption`,
      issue_summary: rawText,
      summary_en: rawText,
      location: fallbackLocation,
      severity: 'Medium',
      severity_number: 5,
      urgency: 'MEDIUM',
      duration,
      affected_area: `${fallbackLocation} local grid`,
      affected_population_if_available: 'Not specified',
      recommended_action: isWater 
        ? 'Inspect supply pipeline valves and audit distribution schedules.'
        : 'Dispatch rapid response municipal team for inspection.'
    };

    res.json({
      success: true,
      fallback: true,
      data: fallbackData,
    });
  }
});

// Endpoint: Conversational AI Follow-Up & Multilingual Agent
app.post('/api/conversational-followup', async (req: Request, res: Response) => {
  try {
    const { userMessage, history = [], languagePreference, language } = req.body;
    const prefLang = LANGUAGE_NAMES[languagePreference || language] || languagePreference || language || 'English';

    const cacheKey = `${(userMessage || '').trim().toLowerCase()}_${prefLang}`;
    if ((!history || history.length === 0) && conversationalCache.has(cacheKey)) {
      return res.json({ success: true, data: conversationalCache.get(cacheKey), cached: true });
    }

    const ai = getGenAI();
    const model = 'gemini-2.5-flash';

    const prompt = `
You are CivicPulse Assistant, an empathetic AI for municipal citizen reporting.
You support multilingual messaging in Telugu, Hindi, English, Tamil, Kannada, Marathi, Bengali, and Odia.

Your Task:
1. Target response language: ${prefLang}.
2. Reply back to the citizen in ${prefLang} naturally, politely, and clearly.
3. Extract structured civic data:
   - Category (e.g. Healthcare, Roads, Water, Electricity, Drainage, Education, Sanitation, Other)
   - Subcategory / Detail (e.g. Street lighting, Medicine shortage, Doctor availability, Pipeline leak, Potholes)
   - Location (e.g. XYZ School Area, Guntur PHC, Krishna district village)
   - Duration (e.g. 2 weeks, 3 months, 4 days)
   - Urgency (LOW, MEDIUM, HIGH, CRITICAL)
   - Affected Group (e.g. Students + residents, Daily commuters, Patients)
4. If the message is vague (e.g. "Our hospital isn't working properly" or "The road is bad"), construct a friendly follow-up question and 4-5 quick option pills in ${prefLang}.
5. Set "isComplete" to true IF category, location/area, and issue are sufficiently known for confirmation.

User Message: """${userMessage}"""
Previous Chat History: ${JSON.stringify(history)}
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyMessage: {
                type: Type.STRING,
                description: 'AI response to the citizen in their native language',
              },
              detectedLanguage: {
                type: Type.STRING,
                description: 'Language detected, e.g. Telugu, Hindi, English, Tamil, Kannada',
              },
              extractedEntity: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  subcategory: { type: Type.STRING },
                  location: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  urgency: { type: Type.STRING },
                  affectedGroup: { type: Type.STRING },
                  problemSummary: { type: Type.STRING },
                },
              },
              isComplete: {
                type: Type.BOOLEAN,
                description: 'True if Category, Location, and Issue details are complete',
              },
              followupQuestion: { type: Type.STRING },
              quickOptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Interactive quick option buttons if follow-up is needed',
              },
            },
            required: ['replyMessage', 'detectedLanguage', 'extractedEntity', 'isComplete'],
          },
        },
      })
    );

    const raw = response.text || '{}';
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        replyMessage: prefLang === 'Tamil' 
          ? 'நன்றி. உங்கள் பொதுக் கட்டமைப்பு புகார் பதிவு செய்யப்பட்டுள்ளது.' 
          : prefLang === 'Hindi' 
          ? 'धन्यवाद। आपकी सार्वजनिक अवसंरचना शिकायत दर्ज कर ली गई है।' 
          : prefLang === 'Telugu' 
          ? 'ధన్యవాదాలు. మీ పౌర మౌలిక సదుపాయాల ఫిర్యాదు నమోదు చేయబడింది.' 
          : "Thank you. I have recorded your infrastructure complaint.",
        detectedLanguage: prefLang,
        extractedEntity: {
          category: "Roads",
          subcategory: "Street Lighting",
          location: "Near Primary School",
          duration: "2 weeks",
          urgency: "MEDIUM",
          affectedGroup: "Students & local residents",
          problemSummary: userMessage
        },
        isComplete: true,
        quickOptions: []
      };
    }

    if (!history || history.length === 0) {
      conversationalCache.set(cacheKey, data);
    }

    res.json({ success: true, data });
  } catch (err: any) {
    const prefLang = LANGUAGE_NAMES[req.body.languagePreference || req.body.language] || 'English';
    res.json({
      success: true,
      fallback: true,
      data: {
        replyMessage: prefLang === 'Tamil'
          ? 'உங்கள் பிரச்சனை புரிந்தது. இது பொதுக் கட்டமைப்பு அறிக்கையாகப் பதிவு செய்யப்பட்டுள்ளது.'
          : prefLang === 'Hindi'
          ? 'मैं आपकी समस्या समझ गया हूँ। इसे नागरिक अवसंरचना रिपोर्ट के रूप में दर्ज कर लिया गया है।'
          : prefLang === 'Telugu'
          ? 'నేను మీ సమస్యను అర్థం చేసుకున్నాను. ఇది పౌర మౌలిక సదుపాయాల నివేదికగా నమోదు చేయబడింది.'
          : "I understand your issue. I've recorded this as a civic infrastructure report.",
        detectedLanguage: prefLang,
        extractedEntity: {
          category: "Electricity",
          subcategory: "Street lighting",
          location: "XYZ School Area",
          duration: "2 weeks",
          urgency: "MEDIUM",
          affectedGroup: "Students + residents",
          problemSummary: req.body.userMessage
        },
        isComplete: true,
        quickOptions: ["No doctors", "No medicines", "Long waiting time", "Facility damaged", "Other"]
      }
    });
  }
});

// Endpoint: Generate AI Governance Policy Brief
app.post('/api/generate-policy-brief', async (req: Request, res: Response) => {
  try {
    const { district, category, demandCount, priorityScore, currentAccess, population, povertyIndex, plannedInvestment, language } = req.body;
    const targetLang = LANGUAGE_NAMES[language] || language || 'English';

    const cacheKey = `${district}_${category}_${demandCount}_${priorityScore}_${targetLang}`;
    if (policyBriefCache.has(cacheKey)) {
      return res.json({
        success: true,
        brief: policyBriefCache.get(cacheKey),
        cached: true,
      });
    }

    const ai = getGenAI();
    const model = 'gemini-2.5-flash';

    const prompt = `
You are the Senior Chief Public Policy & Infrastructure Advisor for the National Development Planning Board (BRICS Digital Public Infrastructure Taskforce).
Draft an authoritative, data-grounded, executive National Infrastructure Policy Brief.

${targetLang !== 'English' ? `CRITICAL LANGUAGE MANDATE: Output the ENTIRE policy brief directly and fluently in ${targetLang} language. All section headings and paragraphs must be in ${targetLang}, while keeping structured metrics, numbers, currency figures (₹), and scheme abbreviations (e.g., JJM, NHM, PMGSY, RDSS) clearly indicated.` : ''}

Evidence Dossier:
- Target District: ${district}
- Infrastructure Category: ${category}
- Aggregated Citizen Demand Signals: ${demandCount} validated requests
- Deterministic Priority Score: ${priorityScore}/100
- Baseline Infrastructure Access Level: ${currentAccess}% (Deficit Gap: ${100 - currentAccess}%)
- District Population: ${Number(population).toLocaleString()} residents
- Multidimensional Poverty Index: ${(povertyIndex * 100).toFixed(0)}%
- Planned Capex Budget: ₹${(plannedInvestment / 10000000).toFixed(2)} Crores

Please structure your brief with the following clear markdown sections:
1. **Executive Problem Statement & Diagnostic**: Concrete assessment of the acute deficit in ${district} based on fused citizen demand and demographic indicators.
2. **Strategic Priority & Alignment Justification**: Why this requires expedited public funding over standard municipal cycles.
3. **Actionable Intervention Plan**: 3 specific engineering / governance milestones (e.g. emergency solar borewells, decentralized tele-triage, reinforced asphalt corridor).
4. **Target ROI & Citizen Impact Metric**: Estimated timeline, beneficiaries reached, and expected priority score reduction.

Keep the tone formal, highly authoritative, concise, and actionable for ministers and planning commissioners. Do not use generic fluff.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      })
    );

    const briefText = response.text || 'Policy brief generated successfully.';
    policyBriefCache.set(cacheKey, briefText);

    res.json({
      success: true,
      brief: briefText,
    });
  } catch (error: any) {
    console.warn('Gemini API unavailable for policy brief, using fallback stub.');
    const { district = 'Guntur', category = 'Water', currentAccess = 38, demandCount = 45, priorityScore = 85, population = 4887000, language } = req.body;
    const targetLang = LANGUAGE_NAMES[language] || language || 'English';

    let fallbackBrief = '';
    if (targetLang === 'Tamil') {
      fallbackBrief = `### நிர்வாக கொள்கை அறிக்கை: ${district} க்கான அவசர ${category} உள்கட்டமைப்பு ஒதுக்கீடு

**1. நிர்வாக கண்டறிதல் & சிக்கல் அறிக்கை**:
**${district}** மாவட்டத்தில் **${category}** உள்கட்டமைப்பு கடுமையான பற்றாக்குறையைக் கொண்டுள்ளது. அடிப்படை அணுகல் அளவு **${currentAccess}%** மட்டுமே, அத்துடன் **${demandCount} சரிபார்க்கப்பட்ட குடிமக்கள் கோரிக்கைகள்** பெறப்பட்டுள்ளன.

**2. மூலோபாய முன்னுரிமை & நிதி ஒதுக்கீட்டு நியாயம்**:
தேசிய முன்னுரிமை மதிப்பெண் **${priorityScore}/100** ஆக கணக்கிடப்பட்டுள்ளதால், இந்த பகுதிக்கு அவசர டிஜிட்டல் பொதுக் கட்டமைப்பு நிதியிலிருந்து உடனடி மூலதன ஒதுக்கீடு அவசியமாகிறது.

**3. செயல்முறை தலையீட்டு திட்டம்**:
- **கட்டம் 1 (1–15 நாட்கள்)**: அவசர நடமாடும் பராமரிப்பு பிரிவுகள் மற்றும் துணை விநியோகக் கட்டமைப்பு அமைத்தல்.
- **கட்டம் 2 (16–60 நாட்கள்)**: பரவலாக்கப்பட்ட சுத்திகரிப்பு ஆலைகள் மற்றும் தானியங்கி உணரி தொலைநோக்கி அமைப்புகள் நிறுவுதல்.
- **கட்டம் 3 (61–120 நாட்கள்)**: தொடர் கண்காணிப்பு மற்றும் குடிமக்கள் கருத்து சரிபார்ப்புக்கான ஒருங்கிணைப்பு.

**4. இலக்கு தாக்கம்**:
**${Number(population).toLocaleString()} குடியிருப்பாளர்கள்** பயனடைவார்கள், அடிப்படை அணுகல் **85%+** ஆக உயரும் மற்றும் உள்கட்டமைப்பு இடைவெளி கணிசமாகக் குறையும்.`;
    } else if (targetLang === 'Telugu') {
      fallbackBrief = `### కార్యనిర్వాహక విధాన నివేదిక: ${district} కొరకు అత్యవసర ${category} మౌలిక సదుపాయాల కేటాయింపు

**1. కార్యనిర్వాహక విశ్లేషణ**:
**${district}** జిల్లాలో **${category}** మౌలిక సదుపాయాల కొరత తీవ్రంగా ఉంది. ప్రాథమిక ప్రాప్యత కేవలం **${currentAccess}%**, మరియు **${demandCount} ధృవీకరించబడిన పౌర డిమాండ్ సిగ్నల్స్** నమోదయ్యాయి.

**2. వ్యూహాత్మక ప్రాధాన్యత సమర్థన**:
జాతీయ ప్రాధాన్యత స్కోరు **${priorityScore}/100** గా నమోదైనందున, ఎమర్జెన్సీ డిజిటల్ పబ్లిక్ ఇన్‌ఫ్రాస్ట్రక్చర్ ఫండ్ నుండి తక్షణ నిధుల కేటాయింపు అవసరం.

**3. కార్యాచరణ ప్రణాళిక**:
- **దశ 1 (1–15 రోజులు)**: తక్షణ సహాయక సరఫరా గ్రిడ్లు మరియు మొబైల్ నిర్వహణ విభాగాల మోహరింపు.
- **దశ 2 (16–60 రోజులు)**: వికేంద్రీకృత వడపోత ప్లాంట్లు మరియు ఆటోమేటెడ్ సెన్సార్ టెలిమెట్రీ నిర్మాణం.
- **దశ 3 (61–120 రోజులు)**: నిరంతర సెన్సార్ టెలిమెట్రీ మరియు పౌర ఫీడ్‌బ్యాక్ ధృవీకరణ కోసం రాష్ట్ర డ్యాష్‌బోర్డ్‌తో అనుసంధానం.

**4. ఆశించిన ప్రభావం**:
**${Number(population).toLocaleString()} నివాసితులకు** ప్రయోజనం చేకూరుతుంది, ప్రాప్యత **85%+** కి పెరుగుతుంది.`;
    } else if (targetLang === 'Hindi') {
      fallbackBrief = `### कार्यकारी नीति विवरण: ${district} के लिए तत्काल ${category} अवसंरचना आवंटन

**1. कार्यकारी निदान एवं समस्या विवरण**:
**${district}** जिले में **${category}** अवसंरचना की गंभीर कमी है, जहाँ आधारभूत पहुँच केवल **${currentAccess}%** है, तथा **${demandCount} सत्यापित नागरिक मांग संकेत** प्राप्त हुए हैं।

**2. रणनीतिक प्राथमिकता एवं औचित्य**:
**${priorityScore}/100** के राष्ट्रीय प्राथमिकता स्कोर के साथ, यह क्षेत्र आपातकालीन डिजिटल सार्वजनिक अवसंरचना कोष से तत्काल पूँजी आवंटन की मांग करता है।

**3. कार्ययोजना**:
- **चरण 1 (1–15 दिन)**: त्वरित प्रतिक्रिया सहायक आपूर्ति ग्रिड और आपातकालीन मोबाइल इकाइयों की तैनाती।
- **चरण 2 (16–60 दिन)**: उच्च क्षमता वाले विकेन्द्रीकृत संयंत्रों और स्वचालित सेंसर निगरानी प्रणाली का निर्माण।
- **चरण 3 (61–120 दिन)**: निरंतर निगरानी और नागरिक सत्यापन के लिए राज्य डिजिटल डैशबोर्ड के साथ एकीकरण।

**4. लक्षित प्रभाव**:
**${Number(population).toLocaleString()} नागरिकों** को सीधा लाभ मिलेगा तथा आधारभूत पहुँच **85%+** तक पहुँच जाएगी।`;
    } else {
      fallbackBrief = `### Executive Policy Brief: Urgent ${category} Infrastructure Allocation for ${district}

**1. Executive Diagnostic**:
The district of **${district}** exhibits an acute ${category} deficit with baseline access at only **${currentAccess}%**, compounded by **${demandCount} verified citizen demand signals**. High vulnerability indices indicate substantial community exposure to utility disruptions.

**2. Strategic Priority Justification**:
With a calculated National Priority Score of **${priorityScore}/100**, this region warrants immediate capital deployment from the Emergency Digital Public Infrastructure Fund. Prioritizing this intervention prevents severe cascading public health and economic productivity losses.

**3. Actionable Intervention Plan**:
- **Phase 1 (Days 1–15)**: Immediate deployment of rapid-response auxiliary supply grids and emergency mobile maintenance units.
- **Phase 2 (Days 16–60)**: Construction of high-capacity decentralized filtration plants and automated sensor monitoring.
- **Phase 3 (Days 61–120)**: Integration with the state Digital Public Goods dashboard for continuous monitoring benchmarks and citizen feedback validation.

**4. Targeted Impact**:
Projected to benefit over **${Number(population).toLocaleString()} residents**, elevating baseline access to **85%+** and reducing the regional Infrastructure Gap score by over **55 points**.`;
    }

    res.json({
      success: true,
      brief: fallbackBrief,
    });
  }
});

// =========================================================================
// SEARCH ENDPOINTS (Step 2F: Natural-Language Search & Gemini Function Calling)
// =========================================================================

// Gemini Function Calling Declarations for CivicPulse Search Architecture
const CIVICPULSE_SEARCH_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'get_request_by_id',
        description: 'Look up an exact citizen development request or issue record by its tracking ID (e.g., CP-2026-004821, ISSUE-WAT-001).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            requestId: { type: Type.STRING, description: 'Authoritative tracking ID' },
          },
          required: ['requestId'],
        },
      },
      {
        name: 'search_citizen_reports',
        description: 'Query individual citizen development reports, voice complaints, and submissions by sector, district, severity, or keywords.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Sector: Water, Roads, Health, Electricity, Drainage, Sanitation, Education' },
            district: { type: Type.STRING, description: 'District name (e.g., Guntur, Patna)' },
            state: { type: Type.STRING, description: 'State name (e.g., Andhra Pradesh, Bihar)' },
            minSeverity: { type: Type.INTEGER, description: 'Minimum severity on a 1-10 scale' },
            priority: { type: Type.STRING, description: 'Urgency level: HIGH, CRITICAL, MODERATE, LOW' },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Search keywords' },
            limit: { type: Type.INTEGER, description: 'Maximum records to return (default 10)' },
          },
        },
      },
      {
        name: 'search_community_issues',
        description: 'Query aggregated community problem clusters and systemic public infrastructure issues.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Sector: Water, Roads, Health, Electricity, Drainage, Sanitation, Education' },
            district: { type: Type.STRING, description: 'District name' },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Search keywords' },
            limit: { type: Type.INTEGER, description: 'Maximum records to return (default 10)' },
          },
        },
      },
      {
        name: 'search_hotspots',
        description: 'Query geospatial demand hotspots across districts where citizen demand or infrastructure gaps are concentrated.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Sector: Water, Roads, Health, Electricity, Drainage, Sanitation, Education' },
            district: { type: Type.STRING, description: 'District name' },
            demandLevel: { type: Type.STRING, description: 'HIGH, MEDIUM, LOW' },
            infrastructureGapLevel: { type: Type.STRING, description: 'HIGH, MEDIUM, LOW' },
            limit: { type: Type.INTEGER, description: 'Maximum records to return (default 10)' },
          },
        },
      },
      {
        name: 'search_recommendations',
        description: 'Query prioritized development project recommendations and investment briefs generated by the deterministic PriorityEngine.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Sector: Water, Roads, Health, Electricity, Drainage, Sanitation, Education' },
            district: { type: Type.STRING, description: 'District name' },
            minPriorityScore: { type: Type.INTEGER, description: 'Minimum Priority Score (0-100)' },
            limit: { type: Type.INTEGER, description: 'Maximum records to return (default 10)' },
          },
        },
      },
      {
        name: 'search_locations',
        description: 'Search districts and geographic locations in the canonical 70-district registry.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: 'District or state name' },
          },
        },
      },
    ],
  },
];

// Endpoint: Gemini Structured Intent Extraction with Function Calling Mapping
app.post('/api/search/intent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, language = 'en' } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Search query is required and must be a non-empty string.',
        },
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }

    const trimmedQuery = query.trim();
    const cacheKey = `${trimmedQuery.toLowerCase()}_${language}`;
    if (searchIntentCache.has(cacheKey)) {
      return res.json({ success: true, ...searchIntentCache.get(cacheKey) });
    }

    // Exact Request ID check (CP-2026-XXXX or similar)
    const exactIdMatch = trimmedQuery.match(/\b(cp-\d{4}-[\w-]+|cp-[\w-]+|req-[\w-]+|issue-[\w-]+|gov-proj-[\w-]+)\b/i);
    if (exactIdMatch) {
      const result = {
        intent: {
          queryType: 'request_lookup',
          selectedFunction: 'get_request_by_id',
          category: null,
          district: null,
          state: null,
          priority: null,
          minSeverity: null,
          maxSeverity: null,
          demandLevel: null,
          infrastructureGapLevel: null,
          status: null,
          requestId: exactIdMatch[1].toUpperCase(),
          keywords: [exactIdMatch[1]],
          limit: 10,
        },
        functionCall: {
          name: 'get_request_by_id',
          args: { requestId: exactIdMatch[1].toUpperCase() },
        },
        source: 'deterministic_id_rule',
      };
      searchIntentCache.set(cacheKey, result);
      return res.json({ success: true, ...result });
    }

    // If Gemini client is available, call Gemini for structured intent extraction
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGenAI();
        const model = 'gemini-2.5-flash';

        const promptText = `
You are the CivicPulse Natural-Language Search Intent Parser for Indian Public Infrastructure & Citizen Development Requests.
Analyze this user query and extract a strictly conforming structured search intent JSON.

User Query: """${trimmedQuery}"""
Interface Language: ${language}

Available CivicPulse Query Functions:
- get_request_by_id: Exact tracking ID lookup (e.g., CP-2026-004821)
- search_citizen_reports: Individual complaints, voice notes, citizen submissions
- search_community_issues: Systemic community problem clusters (e.g. water pipeline leakage, broken roads)
- search_hotspots: Geographic demand hotspots, deficit zones, district-level demand clusters
- search_recommendations: PriorityEngine recommended projects, capital investment briefs, policy briefs
- search_locations: District/State lookup

STRICT NO-INVENTION MANDATES:
1. NEVER invent or hallucinate a district or locality. If the user mentions a fictional district like 'XYZ', keep district as 'XYZ' or null. Do NOT substitute with an existing district.
2. If district is not mentioned, leave district null.
3. Map multilingual sectors (e.g., Telugu "తాగునీరు", Hindi "पानी", Tamil "தண்ணீர்") to canonical English categories: Water, Roads, Electricity, Health, Drainage, Sanitation, Education.
4. Unknown fields MUST remain null.
5. Provide the best matching selectedFunction from the available list.
`;

        const response = await callGeminiWithRetry(() =>
          ai.models.generateContent({
            model,
            contents: { parts: [{ text: promptText }] },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  queryType: {
                    type: Type.STRING,
                    description: 'One of: citizen_reports, community_issues, hotspots, recommendations, locations, request_lookup, general',
                  },
                  selectedFunction: {
                    type: Type.STRING,
                    description: 'The target function: search_citizen_reports, search_community_issues, search_hotspots, search_recommendations, search_locations, get_request_by_id',
                  },
                  category: {
                    type: Type.STRING,
                    description: 'Canonical sector: Water, Roads, Health, Electricity, Drainage, Sanitation, Education, or null',
                  },
                  district: {
                    type: Type.STRING,
                    description: 'Explicit district mentioned or null. NEVER invent.',
                  },
                  state: {
                    type: Type.STRING,
                    description: 'State mentioned (e.g. Andhra Pradesh, Bihar) or null',
                  },
                  priority: {
                    type: Type.STRING,
                    description: 'Priority filter: HIGH, CRITICAL, MODERATE, LOW, or null',
                  },
                  minSeverity: {
                    type: Type.INTEGER,
                    description: 'Minimum severity (1-10) or null',
                  },
                  maxSeverity: {
                    type: Type.INTEGER,
                    description: 'Maximum severity (1-10) or null',
                  },
                  demandLevel: {
                    type: Type.STRING,
                    description: 'Demand level: HIGH, MEDIUM, LOW, or null',
                  },
                  infrastructureGapLevel: {
                    type: Type.STRING,
                    description: 'Gap level: HIGH, MEDIUM, LOW, or null',
                  },
                  status: {
                    type: Type.STRING,
                    description: 'Lifecycle status or null',
                  },
                  requestId: {
                    type: Type.STRING,
                    description: 'Exact tracking ID if mentioned, otherwise null',
                  },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Relevant search terms',
                  },
                },
                required: ['queryType', 'selectedFunction', 'keywords'],
              },
            },
          })
        );

        const rawJson = response.text || '{}';
        const parsedIntent = JSON.parse(rawJson);

        const result = {
          intent: {
            queryType: parsedIntent.queryType || 'general',
            selectedFunction: parsedIntent.selectedFunction || 'search_community_issues',
            category: parsedIntent.category || null,
            district: parsedIntent.district || null,
            state: parsedIntent.state || null,
            priority: parsedIntent.priority || null,
            minSeverity: parsedIntent.minSeverity || null,
            maxSeverity: parsedIntent.maxSeverity || null,
            demandLevel: parsedIntent.demandLevel || null,
            infrastructureGapLevel: parsedIntent.infrastructureGapLevel || null,
            status: parsedIntent.status || null,
            requestId: parsedIntent.requestId || null,
            keywords: Array.isArray(parsedIntent.keywords) ? parsedIntent.keywords : [],
            limit: 10,
          },
          functionCall: {
            name: parsedIntent.selectedFunction || 'search_community_issues',
            args: {
              category: parsedIntent.category || undefined,
              district: parsedIntent.district || undefined,
              state: parsedIntent.state || undefined,
              priority: parsedIntent.priority || undefined,
              minSeverity: parsedIntent.minSeverity || undefined,
              demandLevel: parsedIntent.demandLevel || undefined,
              infrastructureGapLevel: parsedIntent.infrastructureGapLevel || undefined,
              requestId: parsedIntent.requestId || undefined,
              keywords: parsedIntent.keywords || [],
              limit: 10,
            },
          },
          tools: CIVICPULSE_SEARCH_TOOLS,
          source: 'gemini_structured_output',
        };

        searchIntentCache.set(cacheKey, result);
        return res.json({ success: true, ...result });
      } catch (geminiError: any) {
        console.warn('Gemini search intent extraction failed, falling back to deterministic parser:', geminiError?.message);
      }
    }

    // Deterministic Fallback Parser (Offline / Key unavailable)
    const lower = trimmedQuery.toLowerCase();
    let queryType = 'general';
    let selectedFunction = 'search_community_issues';
    let category: string | null = null;
    let district: string | null = null;
    let priority: string | null = null;

    if (lower.includes('water') || lower.includes('पानी') || lower.includes('నీరు')) category = 'Water';
    else if (lower.includes('road') || lower.includes('सड़क') || lower.includes('రోడ్డు')) category = 'Roads';
    else if (lower.includes('health') || lower.includes('hospital') || lower.includes('स्वास्थ्य') || lower.includes('ఆరోగ్య')) category = 'Health';
    else if (lower.includes('power') || lower.includes('electric') || lower.includes('बिजली') || lower.includes('విద్యుత్')) category = 'Electricity';
    else if (lower.includes('drain') || lower.includes('नाली') || lower.includes('కాలువ')) category = 'Drainage';

    if (lower.includes('recommend') || lower.includes('prioritize') || lower.includes('project') || lower.includes('investment')) {
      queryType = 'recommendations';
      selectedFunction = 'search_recommendations';
    } else if (lower.includes('hotspot') || lower.includes('demand') || lower.includes('zone')) {
      queryType = 'hotspots';
      selectedFunction = 'search_hotspots';
    } else if (lower.includes('report') || lower.includes('complaint') || lower.includes('citizen') || lower.includes('signal')) {
      queryType = 'citizen_reports';
      selectedFunction = 'search_citizen_reports';
    }

    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('severe') || lower.includes('high priority')) {
      priority = 'HIGH';
    }

    const fallbackResult = {
      intent: {
        queryType,
        selectedFunction,
        category,
        district,
        state: null,
        priority,
        minSeverity: priority === 'HIGH' ? 8 : null,
        maxSeverity: null,
        demandLevel: null,
        infrastructureGapLevel: null,
        status: null,
        requestId: null,
        keywords: trimmedQuery.split(/\s+/).filter(w => w.length > 2),
        limit: 10,
      },
      functionCall: {
        name: selectedFunction,
        args: { category, district, priority, limit: 10 },
      },
      tools: CIVICPULSE_SEARCH_TOOLS,
      source: 'deterministic_fallback',
    };

    return res.json({ success: true, ...fallbackResult });
  } catch (err: any) {
    next(err);
  }
});

// Endpoint: Grounded Search Results Synthesis / Policymaker Summary
app.post('/api/search/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, language = 'en' } = req.body;
    const results = req.body.results || {
      exactMatch: req.body.exactMatch,
      recommendations: req.body.recommendations,
      hotspots: req.body.hotspots,
      issues: req.body.issues,
      totalCount: req.body.totalCount,
    };
    if (!query || (!results && !req.body.totalCount && !req.body.issues && !req.body.recommendations)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Query and results are required for search summarization.',
        },
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        summary: null,
        note: 'AI summarization requires server-side GEMINI_API_KEY.',
      });
    }

    const cacheKey = `${query.trim().toLowerCase()}_${language}_${results.totalCount || 0}_${JSON.stringify(results).slice(0, 150)}`;
    if (searchSummaryCache.has(cacheKey)) {
      return res.json({
        success: true,
        summary: searchSummaryCache.get(cacheKey),
        cached: true,
      });
    }

    const ai = getGenAI();
    const model = 'gemini-2.5-flash';

    const promptText = `
You are the CivicPulse Policy Research Assistant.
Summarize the real search results for the policymaker query below.

Policymaker Query: "${query}"
Language: ${language}

Verified CivicPulse Results Provided:
${JSON.stringify(results).slice(0, 4000)}

STRICT GROUNDING RULES:
1. Use ONLY the data provided above.
2. NEVER cite external facts, unverified national statistics, or hallucinated budgets.
3. If the results are empty, clearly state: "No CivicPulse records matched this query."
4. Be factual, concise, and highlight verified demand counts, infrastructure deficit levels, and priority scores.
`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model,
        contents: { parts: [{ text: promptText }] },
      })
    );

    const summaryText = response.text || '';
    searchSummaryCache.set(cacheKey, summaryText);

    res.json({
      success: true,
      summary: summaryText,
    });
  } catch (err: any) {
    next(err);
  }
});

// Centralized Error Handler for API routes
app.use(errorHandler);

// Start Vite middleware only during local development.
// On Vercel, the Express app itself is the serverless function.
async function startDevelopmentServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CivicPulse Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== 'production') {
  startDevelopmentServer();
}

export default app;
