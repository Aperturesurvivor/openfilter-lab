import type { AnnotationEvent, EventCandidate } from "./types.js";

export type MergeOptions = {
  padStartMs?: number;
  padEndMs?: number;
  mergeGapMs?: number;
};

export function normalizeEventCandidates(
  candidates: EventCandidate[],
  runtimeMs: number,
  options: MergeOptions = {}
): AnnotationEvent[] {
  const padStartMs = options.padStartMs ?? 0;
  const padEndMs = options.padEndMs ?? 0;
  const mergeGapMs = options.mergeGapMs ?? 750;

  const padded = candidates
    .map((candidate, index) => ({
      ...candidate,
      id: candidate.id ?? `evt_draft_${String(index + 1).padStart(4, "0")}`,
      startMs: Math.max(0, candidate.startMs - padStartMs),
      endMs: Math.min(runtimeMs, candidate.endMs + padEndMs)
    }))
    .filter((event) => event.endMs > event.startMs)
    .sort((a, b) => a.startMs - b.startMs);

  const merged: AnnotationEvent[] = [];
  for (const event of padded) {
    const previous = merged.at(-1);
    if (
      previous &&
      previous.category === event.category &&
      previous.defaultAction === event.defaultAction &&
      event.startMs - previous.endMs <= mergeGapMs
    ) {
      previous.endMs = Math.max(previous.endMs, event.endMs);
      previous.severity = Math.max(previous.severity, event.severity) as AnnotationEvent["severity"];
      previous.confidence = Math.max(previous.confidence, event.confidence);
      previous.tags = Array.from(new Set([...previous.tags, ...event.tags]));
      previous.note = `${previous.note}; ${event.note}`;
      continue;
    }

    merged.push(event);
  }

  return merged;
}
