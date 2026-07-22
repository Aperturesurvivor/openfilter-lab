import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { VisionClassifierInput, VisionClassifierResult, VisionDetection } from "./classifierTypes.js";
import { detectionsToCandidates } from "./classifierTypes.js";

export type GeminiVisionOptions = {
  apiKey: string;
  model: string;
  maxFrames: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export async function classifyFramesGemini(
  input: VisionClassifierInput,
  options: GeminiVisionOptions
): Promise<VisionClassifierResult> {
  if (!options.apiKey) {
    throw new Error("GEMINI_API_KEY is required for --classify-frames provider gemini");
  }

  const selectedSamples = input.samples.slice(0, options.maxFrames);
  const parts: Array<Record<string, unknown>> = [
    {
      text: buildPrompt(input.mediaTitle, selectedSamples.map((sample) => sample.timestampMs))
    }
  ];

  for (const sample of selectedSamples) {
    const bytes = await readFile(sample.path);
    parts.push({
      text: `Frame ${sample.index}: ${basename(sample.path)}, timestampMs=${sample.timestampMs}`
    });
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: bytes.toString("base64")
      }
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": options.apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  const detections = parseDetections(text);

  return {
    detections,
    candidates: detectionsToCandidates(detections, input.frameWindowMs),
    rawProviderResponse: payload
  };
}

function buildPrompt(mediaTitle: string, timestamps: number[]): string {
  return `You are classifying movie frame samples for an offline family media filtering annotation file.

Media title: ${mediaTitle}
Frame timestamps in this request: ${timestamps.join(", ")} ms

Return ONLY valid JSON with this exact shape:
{
  "detections": [
    {
      "timestampMs": 0,
      "category": "sexual-content | violence | substance-use",
      "severity": 1,
      "confidence": 0.0,
      "recommendedAction": "skip | blank",
      "tags": ["short-tag"],
      "note": "brief visual evidence"
    }
  ]
}

Rules:
- Only report visible content-control issues that can be judged from the image.
- Use categories only from: sexual-content, violence, substance-use.
- Do not classify ordinary faces, clothing, romance, weapons that are merely decorative, or ambiguous background objects.
- Use severity 1-5 where 1 is mild/contextual and 5 is explicit/graphic.
- Use recommendedAction "skip" for scene content and "blank" only when the audio might be safe but the frame should not be visible.
- Keep notes factual and short. Do not identify actors or real people.
- If there are no relevant issues, return {"detections":[]}.`;
}

function parseDetections(text: string): VisionDetection[] {
  const parsed = JSON.parse(text) as { detections?: VisionDetection[] };
  const detections = parsed.detections ?? [];
  return detections.filter((detection) => {
    return (
      Number.isFinite(detection.timestampMs) &&
      ["sexual-content", "violence", "substance-use"].includes(detection.category) &&
      detection.severity >= 1 &&
      detection.severity <= 5 &&
      detection.confidence >= 0 &&
      detection.confidence <= 1 &&
      ["skip", "blank"].includes(detection.recommendedAction)
    );
  });
}
