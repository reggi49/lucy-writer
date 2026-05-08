---
name: lucy-writer
description: Fully autonomous tech-blog writing agent. Scrapes web references, generates SEO-friendly articles using a multi-layer LLM failover (Gemini/Ollama), creates dynamic branded thumbnails via Canvas & AI, and publishes automatically via API.
license: MIT
metadata:
  author: Muhamad Reggi
  version: 2.2.0
---

# Lucy Writer

A fully autonomous tech-blog writing automation tool. Lucy Writer extracts content from target URLs (bypassing basic anti-bot protections), synthesizes it into natural, SEO-optimized articles using a triple-layer LLM failover system, generates dynamic flat-design thumbnails, and publishes the final payload directly to your CMS endpoint.

## Setup

Set your API keys and endpoint URLs in a local `.env` file (ensure this is added to your `.gitignore`):

```bash
# .env (do not commit)
GEMINI_API_KEY=your_gemini_key_here
POLLINATIONS_KEY=your_pollinations_key_here
PEXELS_KEY=your_pexels_key_here
SECRET_KEY=your_cms_secret_key_here
API_ENDPOINT=https://yourdomain.com/api/posts/lucy
OLLAMA_URL=http://localhost:11434/api/generate
```

**System Dependencies:**
Since this tool uses HTML5 Canvas for dynamic image generation, ensure your system has the required graphic libraries installed before running `npm install canvas` (e.g., `libcairo2-dev`, `libjpeg-dev` on Ubuntu or Mac equivalents).

## When to Use This Skill

**Use `lucy-writer` when:**
- Automating tech-news or tutorial articles based on existing web sources.
- You need strict adherence to facts without AI hallucinations (grounded generation).
- You require consistently branded, typography-perfect thumbnail images generated on-the-fly.
- You need a highly resilient script that can survive API rate limits (429) or server downtimes.

**Don't use this skill for:**
- Purely creative or fictional writing where no external reference is needed.
- Scraping highly secure web applications requiring complex CAPTCHA bypass (consider integrating Tavily API for that).

## Usage / CLI Arguments

Run the script via Node.js by providing the required flags:

```bash
node index.js --topic "Your Article Topic" --category "categoryIdString" --targetUrls "url1,url2,url3"
```

**Parameters:**
- `--topic` (required) — The main keyword and title context for the article (e.g., "Setup DualSense on PC").
- `--category` (required) — The category ID mapping for your target CMS database.
- `--targetUrls` (required) — A comma-separated list of reference URLs to scrape.

## The Triple-Layer Architecture

Lucy Writer is built for maximum resilience using a layered failover strategy.

### 1. Text Generation Engine
- **Layer 1:** `gemini-2.5-flash` (Fast, high-quality reasoning)
- **Layer 2:** `gemini-2.5-flash-lite` (Triggered on 429 limits, 503 errors, or high demand)
- **Layer 3:** `Local Ollama` (e.g., qwen3.5:9b) (Absolute offline fallback if Google APIs are unreachable)

### 2. Image Generation Engine
- **Layer 1 (Dynamic Canvas + Pollinations AI):** Generates a random flat-color background, plots a circular mask, fetches a clean isolated object from Flux AI, and renders perfect typography using Canvas.
- **Layer 2 (Pexels Stock + Overlay):** If AI generation fails, fetches a high-quality stock photo based on AI-extracted keywords and adds a dark overlay with centered typography.
- **Layer 3 (Placeholder):** If all visual APIs fail, injects a lightweight 1px transparent base64 image to prevent database insertion errors.

## Content & SEO Rules (Built-in)
- **Anti-Hallucination:** Strictly extracts facts from scraped DOM; no outside assumptions.
- **Humanized Tone:** Avoids AI clichés ("In this digital era", "Crucial", em-dashes). Emulates a casual, Discord-like tech enthusiast tone.
- **Formatting:** Enforces Markdown code fences (no raw `<pre>` tags) and requires Markdown Tables for technical specs.

## Pricing & Limits
- **Google Gemini:** Free tier available, but strictly rate-limited. Script handles `429/503` gracefully.
- **Pexels API:** Free up to 20,000 requests/month.
- **Pollinations AI:** Currently free/open, subject to change.
- **Ollama:** 100% Free, utilizes local compute.

## Security & Anti-Bot Notes
- **Stealth Axios:** The scraper is equipped with modern Chrome/macOS headers to bypass basic WAF and 403 Forbidden errors.
- **No Direct Execution:** The script does not execute downloaded JavaScript from target URLs (safe parsing via `JSDOM` and `Readability`).