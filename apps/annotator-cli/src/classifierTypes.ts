import type { EventCandidate, FilterAction, FilterCategory } from "@openfilter/core";
import type { FrameSample } from "./frameSampler.js";

export type VisionDetection = {
  timestampMs: number;
  category: FilterCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  recommendedAction: FilterAction;
  tags: string[];
  note: string;
};

export type VisionClassifierInput = {
  samples: FrameSample[];
  mediaTitle: string;
  frameWindowMs: number;
};

export type VisionClassifierResult = {
  detections: VisionDetection[];
  candidates: EventCandidate[];
  rawProviderResponse?: unknown;
};

export function detectionsToCandidates(
  detections: VisionDetection[],
  frameWindowMs: number
): EventCandidate[] {
  return detections.map((detection) => ({
    startMs: detection.timestampMs,
    endMs: detection.timestampMs + frameWindowMs,
    category: detection.category,
    severity: detection.severity,
    defaultAction: detection.recommendedAction,
    tags: detection.tags,
    note: detection.note,
    confidence: detection.confidence,
    source: "vision"
  }));
}
