import { filterCategories } from "./categories.js";
import type { OpenFilterAnnotation } from "./types.js";

export function validateAnnotationShape(annotation: OpenFilterAnnotation): string[] {
  const errors: string[] = [];
  if (annotation.schema !== "https://openfilter.local/schema/v0.1") {
    errors.push("schema must be https://openfilter.local/schema/v0.1");
  }
  if (!annotation.annotationId) errors.push("annotationId is required");
  if (!annotation.createdAt) errors.push("createdAt is required");
  if (!annotation.media?.runtimeMs || annotation.media.runtimeMs <= 0) {
    errors.push("media.runtimeMs must be positive");
  }
  if (!annotation.media?.sourceUrl) errors.push("media.sourceUrl is required");
  if (!annotation.media?.fingerprints?.sourceId) errors.push("media.fingerprints.sourceId is required");
  if (!Array.isArray(annotation.coverage)) errors.push("coverage must be an array");
  if (!Array.isArray(annotation.events)) errors.push("events must be an array");

  for (const category of filterCategories) {
    if (!annotation.coverage.some((entry) => entry.category === category)) {
      errors.push(`coverage missing ${category}`);
    }
  }

  const ids = new Set<string>();
  for (const [index, event] of annotation.events.entries()) {
    if (!event.id) errors.push(`events[${index}].id is required`);
    if (ids.has(event.id)) errors.push(`events[${index}].id is duplicated`);
    ids.add(event.id);
    if (event.startMs < 0) errors.push(`${event.id}.startMs must be >= 0`);
    if (event.endMs <= event.startMs) errors.push(`${event.id}.endMs must be after startMs`);
    if (event.endMs > annotation.media.runtimeMs) {
      errors.push(`${event.id}.endMs exceeds media.runtimeMs`);
    }
    if (!filterCategories.includes(event.category)) {
      errors.push(`${event.id}.category is unsupported`);
    }
    if (event.severity < 1 || event.severity > 5) {
      errors.push(`${event.id}.severity must be 1-5`);
    }
    if (event.confidence < 0 || event.confidence > 1) {
      errors.push(`${event.id}.confidence must be 0-1`);
    }
  }

  return errors;
}
