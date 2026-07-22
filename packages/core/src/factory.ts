import { filterCategories } from "./categories.js";
import type { MediaFingerprint, OpenFilterAnnotation } from "./types.js";

export type CreateDraftAnnotationInput = {
  title: string;
  year?: number | null;
  edition: string;
  runtimeMs: number;
  sourceUrl: string;
  fingerprint: MediaFingerprint;
  createdAt?: string;
};

export function createDraftAnnotation(input: CreateDraftAnnotationInput): OpenFilterAnnotation {
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return {
    schema: "https://openfilter.local/schema/v0.1",
    annotationId: `ofann_${slug || "untitled"}_${Date.now()}`,
    title: `${input.title} draft annotation`,
    license: "CC0-1.0",
    createdAt: input.createdAt ?? new Date().toISOString(),
    media: {
      title: input.title,
      year: input.year ?? null,
      edition: input.edition,
      runtimeMs: input.runtimeMs,
      sourceUrl: input.sourceUrl,
      fingerprints: input.fingerprint
    },
    coverage: filterCategories.map((category) => ({
      category,
      reviewed: false,
      reviewer: "openfilter-annotator-cli"
    })),
    events: []
  };
}
