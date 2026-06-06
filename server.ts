import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Create Express app
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize GoogleGenAI client with key from process.env
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Primary generation prompt guidelines
const MASTER_SYSTEM_INSTRUCTION = `
You are the world's most elite Mobile Web App Generator. You design and code pristine, production-ready, fully interactive standalone single-page applications.

Guidelines for generated HTML code:
1. Deliver ONLY a completely self-contained, valid, robust single-page HTML bundle. No external dependencies, other than standard CDNs:
   - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
   - Optionally FontAwesome or Google Fonts for gorgeous typography and visual items.
   - Fully compatible modern client-side JavaScript.
2. The app must be fully interactive and completely functional. For example, if it's a calculator, write robust JS math parsing; if it's a task manager, support adding, deleting, filtering, and local state; if it's a game, write full requestAnimationFrame animations, audio-synthesis, score states, and touch/click controls.
3. Keep the visual design extraordinarily premium and styled for mobile screens (iOS/Android responsive):
   - Choose a distinct color palette (warm slate, neon cyberpunk, minimal swiss, sage green organic, pastel playground) based on the app's prompt.
   - Include soft shadows, elegant micro-animations, active select transitions, modern typography, spacious touch-targets (min 44px), and detailed interactive states (loading buttons, full empty states).
   - Leverage beautiful system SVG icons or inline SVG symbols (no broken remote images).
4. No console warning or syntax errors. Ensure proper event bindings and error handling.
5. Emphasize standard layout structures, beautiful headers, dynamic counters, helpful instructions, clear labels, and delightful interactive feedback.
`;

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// POST "/api/generate"
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, platform, extraInstructions, category } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "A prompt is required to build an app" });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please add it to Settings -> Secrets.",
      });
    }

    const platformText = platform === "ios" ? "Apple iOS (iPhone XR/15 Pro) optimized safe areas and swipe actions" : "Android (Material Design 3 elements and ripples) optimized";

    const promptMessage = `
Craft a gorgeous, high-fidelity responsive single-page web app styled under a simulated ${platformText} ecosystem.
Target Category: ${category || "Utility / General"}
App Concept prompt: "${prompt}"

Additional configuration requirements:
${extraInstructions || "Make it highly interactive, visually distinctive with beautiful layouts and custom state."}

Return a valid JSON output matching the specified schema. Make sure the HTML code field is a fully complete standalone HTML body containing CSS, Tailwind script, JS logic, state variables, and beautiful layouts.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction: MASTER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "description", "code", "icon", "category", "features"],
          properties: {
            title: {
              type: Type.STRING,
              description: "Elegant, crisp, human name for the created application (e.g. 'Retro Sync Synth' or 'Sleek Calorie Clock')",
            },
            description: {
              type: Type.STRING,
              description: "A professional 1-2 sentence description explaining what the app achieves.",
            },
            code: {
              type: Type.STRING,
              description: "The full absolute standalone single-file HTML code with embedded styles, script logic, responsive layouts, Tailwind script integration, and event handlers.",
            },
            icon: {
              type: Type.STRING,
              description: "A standard lowercase Lucide-react icon name representing the app (e.g., 'calculator', 'clipboard-list', 'gauge', 'gem', 'activity', 'music')",
            },
            category: {
              type: Type.STRING,
              description: "The category of the app, e.g., UTILITY, GAME, PRODUCTIVITY, EDUCATION, CREATIVE, LIFESTYLE",
            },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-4 key interactive features built into this revision.",
            },
          },
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Failed to retrieve text content stream from Gemini.");
    }

    const parsedJson = JSON.parse(responseText);
    res.json(parsedJson);
  } catch (error: any) {
    console.error("API Generation Error: ", error);
    res.status(500).json({
      error: error?.message || "An error occurred during application construction.",
    });
  }
});

// POST "/api/refine"
app.post("/api/refine", async (req, res) => {
  try {
    const { prompt, currentCode, platform, extraInstructions } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "A refinement instructions prompt is required" });
    }
    if (!currentCode) {
      return res.status(400).json({ error: "Existing code is required to implement improvements" });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please add it to Settings -> Secrets.",
      });
    }

    const promptMessage = `
You are tasked with improving or refining an existing standalone single-page application.
Here is the current operational HTML code:
\`\`\`html
${currentCode}
\`\`\`

The user requests the following evolutionary changes or bug-fixes:
"${prompt}"

Ecosystem platform style: ${platform || "cross-platform"}
Additional constraints:
${extraInstructions || ""}

Critically preserve all existing useful features, and append/enhance the layout and state variables in the HTML. Solve the request exactly. Retain any standard Tailwind styles and ensure it remains 100% self-contained in the 'code' response field.
Return a valid JSON matching the specified schema containing the improved title, updated description, complete updated HTML, refreshed list of features, and category.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction: MASTER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "description", "code", "icon", "category", "features"],
          properties: {
            title: {
              type: Type.STRING,
              description: "Refined or preserved crisp name for the application.",
            },
            description: {
              type: Type.STRING,
              description: "An updated explanation highlighting the newly implemented features/fixes.",
            },
            code: {
              type: Type.STRING,
              description: "The complete revised single-file HTML code carrying all enhancements and existing layouts intact.",
            },
            icon: {
              type: Type.STRING,
              description: "Lowercase Lucide link representing the app category.",
            },
            category: {
              type: Type.STRING,
              description: "Calculated primary category.",
            },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Comprehensive list of items or updates built into this application version.",
            },
          },
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Failed to fetch refinement responses from Gemini.");
    }

    const parsedJson = JSON.parse(responseText);
    res.json(parsedJson);
  } catch (error: any) {
    console.error("API Refinement Error: ", error);
    res.status(500).json({
      error: error?.message || "An error occurred during application refinement.",
    });
  }
});

// Setup Vite development stream or fallback static build
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
    console.log(`Server launched and active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
