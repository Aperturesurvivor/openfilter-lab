import type { VisionClassifierInput, VisionClassifierResult } from "./classifierTypes.js";
import { detectionsToCandidates } from "./classifierTypes.js";

export async function classifyFramesMock(input: VisionClassifierInput): Promise<VisionClassifierResult> {
  const middleSample = input.samples[Math.floor(input.samples.length / 2)] ?? input.samples[0];
  const detections = middleSample
    ? [
        {
          timestampMs: middleSample.timestampMs,
          category: "violence" as const,
          severity: 3 as const,
          confidence: 0.75,
          recommendedAction: "skip" as const,
          tags: ["mock-vision-detection"],
          note: "Mock classifier detection for pipeline verification."
        }
      ]
    : [];

  return {
    detections,
    candidates: detectionsToCandidates(detections, input.frameWindowMs)
  };
}
