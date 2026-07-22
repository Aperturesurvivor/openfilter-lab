export type FilterCategory =
  | "language"
  | "blasphemy"
  | "sexual-content"
  | "violence"
  | "substance-use";

export type FilterAction = "mute" | "skip" | "blank";

export type AnnotationSource =
  | "human"
  | "subtitle"
  | "transcript"
  | "vision"
  | "audio"
  | "imported"
  | "fixture";

export type AnnotationEvent = {
  id: string;
  startMs: number;
  endMs: number;
  category: FilterCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  defaultAction: FilterAction;
  tags: string[];
  note: string;
  confidence: number;
  source?: AnnotationSource;
};

export type MediaFingerprint = {
  sourceId: string;
  durationMs: number;
  chapterStartsMs: number[];
  subtitleHash?: string;
  videoHash?: string;
  audioHash?: string;
};

export type OpenFilterAnnotation = {
  schema: "https://openfilter.local/schema/v0.1";
  annotationId: string;
  title: string;
  license: string;
  createdAt: string;
  media: {
    title: string;
    year: number | null;
    edition: string;
    runtimeMs: number;
    sourceUrl: string;
    fingerprints: MediaFingerprint;
  };
  coverage: Array<{
    category: FilterCategory;
    reviewed: boolean;
    reviewer: string;
  }>;
  events: AnnotationEvent[];
};

export type CategoryProfile = {
  enabled: boolean;
  minSeverity: number;
  action: FilterAction;
};

export type FilterProfile = Record<FilterCategory, CategoryProfile>;

export type ActiveDecision = {
  event: AnnotationEvent;
  action: FilterAction;
};

export type EventCandidate = Omit<AnnotationEvent, "id"> & {
  id?: string;
};
