import type { ActiveDecision, AnnotationEvent, FilterProfile } from "./types.js";

export function getActiveDecisions(
  events: AnnotationEvent[],
  currentMs: number,
  profile: FilterProfile
): ActiveDecision[] {
  return events
    .filter((event) => currentMs >= event.startMs && currentMs < event.endMs)
    .map((event) => {
      const category = profile[event.category];
      if (!category.enabled || event.severity < category.minSeverity) {
        return null;
      }
      return { event, action: category.action };
    })
    .filter((decision): decision is ActiveDecision => decision !== null);
}

export function findNextSkipBoundary(decisions: ActiveDecision[]): number | null {
  const skipEnds = decisions
    .filter((decision) => decision.action === "skip" || decision.action === "blank")
    .map((decision) => decision.event.endMs);

  return skipEnds.length > 0 ? Math.max(...skipEnds) : null;
}
