---
module: 2
position: 5
title: "Images, vision, audio, and the multimodal stack"
objective: "Generate images, parse documents and screenshots, transcribe audio, and synthesize speech with the OpenAI multimodal APIs."
estimated_minutes: 13
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Images, vision, audio, and the multimodal stack

## The puzzle

A user uploads a screenshot of a spreadsheet. They ask "what's the total in Q4?"

A customer leaves a voicemail. You want to transcribe it and route it.

A marketing team needs 100 product images for a launch.

A startup wants a voice-based AI assistant.

None of these are *text* tasks. The OpenAI models can handle them anyway — through the multimodal stack. This lesson covers what's there, how to use it, and when each piece is the right tool.

## The simple version

OpenAI's API has dedicated capabilities for non-text inputs and outputs:

- **Vision** — pass images as part of a regular GPT-5 call; the model reads them like text.
- **Image generation** — generate images from text prompts.
- **Speech-to-text** — transcribe audio to text (Whisper and successors).
- **Text-to-speech** — synthesize voice from text.
- **Realtime API** — low-latency streaming voice for interactive applications.
- **Video generation** — generate video (limited availability depending on model).

Most multimodal needs are covered by combining a small number of these. This lesson walks through each with working patterns.

## The technical version

### Vision — images as input

Modern GPT-5 family models are *multimodal*: they can take images as input alongside text.

```js
const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "What's the total revenue in Q4?" },
        {
          type: "input_image",
          image_url: "https://example.com/spreadsheet.png"
        }
      ]
    }
  ]
});
```

Or with a local image as a base64 data URI:

```js
const fs = require("fs");
const base64 = fs.readFileSync("spreadsheet.png").toString("base64");

const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "What's the total revenue in Q4?" },
        {
          type: "input_image",
          image_url: `data:image/png;base64,${base64}`
        }
      ]
    }
  ]
});
```

Things to know:

- **Token cost depends on image resolution.** Larger images = more tokens. There's usually a `detail` parameter (`low`, `high`, `auto`) to control this.
- **Common formats supported**: PNG, JPEG, WEBP, non-animated GIF.
- **Limits per request**: usually a handful of images, max size per image, max total tokens.
- **OCR is implicit.** The model reads text in images natively — no separate OCR step needed.

Vision use cases that work well:

- Parsing screenshots and forms
- Reading invoices, receipts, ID documents
- Identifying objects, layouts, UI elements
- Describing images for accessibility
- Reading charts and graphs
- Code in images

Vision use cases where you need other tools:

- Pixel-perfect measurements (use a vision-specialized library)
- Very large documents (split into chunks, process each)
- Real-time video processing (use a streaming pipeline)

### Image generation

Generate images from a text prompt using the image-generation API:

```js
const result = await openai.images.generate({
  model: "gpt-image-1",
  prompt: "A black-and-white cinematic photo of a cyclist crossing the Brooklyn Bridge at dawn, motion blur on the wheels.",
  size: "1024x1024",
  quality: "high",
});

const imageUrl = result.data[0].url;
```

Key parameters:

- **`size`** — common sizes like 1024x1024, 1792x1024, 1024x1792 (vertical).
- **`quality`** — usually `standard` or `high`.
- **`style`** — sometimes available for stylistic control.
- **`n`** — number of images to generate.

You can also do **image editing** (modify an existing image with a text instruction) and **image variations** (generate variants of an input image), depending on the model.

Pricing is per image generated (not per token). Higher quality and size cost more.

Use cases:

- Marketing imagery
- Product mockups
- Illustration for content
- Concept art / mood boards
- A/B testing visuals

When to *not* use image generation:

- When you need a specific real product photo (use real photography)
- When brand consistency matters (output varies between calls)
- When precise typography matters (text in generated images is often wonky)
- When you need a vector / editable file (most generation is raster)

### Speech-to-text (transcription)

Convert audio to text:

```js
const fs = require("fs");

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("voicemail.mp3"),
  model: "whisper-1",  // or current successor
  language: "en",  // optional, auto-detected if omitted
  response_format: "verbose_json",  // adds timestamps + word-level info
});

console.log(transcription.text);
```

Key parameters:

- **`file`** — audio file (mp3, wav, m4a, webm, ogg, flac, etc.).
- **`model`** — Whisper or its successors (check current docs).
- **`language`** — hint about the source language; auto-detect works for most languages.
- **`response_format`** — `text`, `json`, `verbose_json`, `srt`, `vtt`. Use `verbose_json` for timestamps.
- **`prompt`** — optional context to bias the transcription (e.g., names that might be misheard).

Limits:

- File size limit (usually around 25 MB). For longer audio, split it before sending.
- Output token limits apply.

Use cases:

- Voicemail transcription
- Meeting note generation (combine with summarization)
- Subtitle generation (use SRT/VTT output)
- Accessibility (live transcription)
- Search over audio archives

### Text-to-speech (voice synthesis)

Synthesize speech from text:

```js
const speech = await openai.audio.speech.create({
  model: "tts-1",  // or successor model
  voice: "alloy",  // alloy, echo, fable, onyx, nova, shimmer, etc.
  input: "Welcome back. You have three new messages.",
  response_format: "mp3",
  speed: 1.0,
});

const buffer = Buffer.from(await speech.arrayBuffer());
fs.writeFileSync("welcome.mp3", buffer);
```

Voices vary in tone and gender. They're synthetic but quite natural. Output formats include mp3, opus, aac, flac, pcm.

Use cases:

- Notifications and alerts in voice
- Audiobook generation
- Voice-based UI for accessibility
- Localized announcements
- Podcast intros / outros

Limitations:

- Pronunciation of names and uncommon words varies. Sometimes you need to spell phonetically.
- Emotion control is limited compared to human speech.
- Voice cloning isn't generally available for arbitrary voices.

### Realtime API for voice agents

For interactive voice — where latency matters — use the Realtime API:

- **Bidirectional streaming**: audio in, audio out (or text out), in real time.
- **Low latency**: typically sub-1-second responses including the model's processing.
- **WebRTC or WebSocket** transport.
- Supports tool calls during a voice conversation.

This is what you use for phone-call-style AI agents, voice assistants, real-time translation, and similar.

The Realtime API is significantly more complex than the regular APIs — it's a streaming session, not a one-shot request. Worth the complexity when latency matters; overkill when it doesn't.

For non-realtime voice (transcribe an upload, generate a TTS clip), the regular audio APIs are easier.

### Combining modalities

Real products often chain multimodal capabilities:

**"Voice-controlled customer support":**
1. User speaks → Realtime API or speech-to-text.
2. Transcription + customer context → GPT-5 mini with tool use.
3. Response text → text-to-speech (or Realtime continues the audio stream).
4. Audio plays back to the user.

**"Receipt expense report":**
1. User uploads a receipt photo.
2. Vision-enabled GPT-5 extracts merchant, date, amount, line items (with structured output).
3. Structured data flows into the expense system.

**"AI-generated marketing campaign":**
1. Product description → GPT-5 generates campaign copy.
2. Same description → image-generation model creates visuals.
3. Optional: TTS for video voiceovers.

The pieces are simple. Combining them is where you build differentiated products.

### Cost considerations

Multimodal costs vary by modality:

- **Vision**: priced per input image (tied to resolution/tokens). A typical screenshot is $0.001–$0.01.
- **Image generation**: priced per image generated. $0.04–$0.20 each depending on size/quality.
- **Speech-to-text**: priced per minute of audio. ~$0.006 per minute for Whisper.
- **Text-to-speech**: priced per character. ~$0.015 per 1,000 characters for standard models.
- **Realtime API**: priced per minute of audio in / out, separately.

Multimodal applications tend to be more expensive per interaction than text-only. Build accordingly.

### Privacy and content policies

Multimodal data is often more sensitive than text:

- Photos may contain people, locations, documents.
- Audio captures voices that are personally identifiable.
- ID documents and financial documents are regulated.

Apply the same care you would with any user data:

- Don't store more than needed.
- Comply with regional data residency rules.
- Use OpenAI's data retention controls (you can opt some endpoints out of training).
- Apply content moderation as needed.

OpenAI has a Moderation API for text content. Image and audio content also have content policies that apply.

## An analogy: the polymath assistant

A regular assistant takes notes when you talk. A multimodal assistant:

- Takes the photo of the menu you're considering and reads the prices to you.
- Listens to the voicemail and tells you who called and what they want.
- Generates a sketch of the product you're describing.
- Reads aloud the article you don't have time to scan.

The same intelligence, applied across senses. That's the multimodal stack — the same underlying models, accessed through APIs specialized for different input/output types.

The skill is *deciding which sense to use* for each task. Just because you *can* generate an image doesn't mean it's better than a photo. Just because you can voice-synthesize doesn't mean it's better than text. Pick the modality that fits the actual user need.

## Three real-world scenarios

**Scenario 1: The expense system that handled receipts in 30 seconds.**
A company built an expense app where users snap a receipt photo. GPT-5 vision extracts merchant, date, amount, line items as structured output. The user reviews on screen and submits. Previously: 5 minutes of manual data entry per receipt. Now: 30 seconds, mostly the user double-checking. Adoption jumped because the friction disappeared.

**Scenario 2: The voicemail triage system.**
A small business was drowning in voicemails. They wired up: voicemail audio → Whisper transcription → GPT-5 categorization → urgent ones SMS'd to the owner, non-urgent ones queued in a dashboard. Cost: ~$50/month for hundreds of calls. Time savings: hours per week.

**Scenario 3: The product photo generator that didn't work.**
A team tried to use image generation for product catalog photos. They wanted exact, brand-consistent shots of their actual products. Image generation produced *plausible* product images but they were never the actual product. They reverted to professional photography. Lesson: generation is for novel imagery, not pixel-perfect representation of real things.

## Common mistakes to avoid

- **Using image generation when you need a real photo.** Generated images are creative, not reproductive. Brand-consistency is hard.
- **Sending huge images at full resolution.** Costs more without quality benefit; downscale to a reasonable size first.
- **Skipping `verbose_json` for transcription when you need timestamps.** You can't recover them later without re-transcribing.
- **Using Realtime API when a simpler approach would work.** Realtime is complex; only worth it when latency is the product.
- **Forgetting moderation on user-supplied content.** Especially for image inputs in public-facing products.
- **Not handling rate limits / file size limits.** Multimodal endpoints have separate limits from text endpoints.

## Read more

- [Images and vision guide](https://platform.openai.com/docs/guides/images-vision)
- [Audio guide](https://platform.openai.com/docs/guides/audio)
- [Realtime API guide](https://platform.openai.com/docs/guides/realtime)
- [Image generation guide](https://platform.openai.com/docs/guides/image-generation)

## Summary

- The OpenAI API supports **images** (vision input + image generation), **audio** (transcription + TTS), and **realtime voice** (low-latency streaming).
- **Vision is built into the GPT-5 family** — pass images alongside text in regular API calls. Implicit OCR included.
- **Image generation** is good for novel imagery, not pixel-perfect representations of real products.
- **Speech-to-text** (Whisper) handles upload-and-transcribe; supports multiple languages and structured timestamp output.
- **Text-to-speech** synthesizes voice from text. Several voice options. Limited emotion / pronunciation control.
- **Realtime API** for interactive voice. Use only when low latency is the product; complex otherwise.
- Combine modalities to build differentiated products. The pieces are simple; the orchestration is where the value is.
- Multimodal applications cost more per interaction than text-only. Plan accordingly.

That wraps Module 2. You now have the core capabilities: prompting, structured output, function calling, embeddings, and multimodal. Most production OpenAI products are built from these primitives.

Up next: Module 3 — agents. Tools used in sequence, agent loops, the Agents SDK, MCP, and the safety patterns you need before going live.
