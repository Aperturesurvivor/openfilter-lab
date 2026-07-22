import type { FilterCategory } from "./types.js";

export const filterCategories: FilterCategory[] = [
  "language",
  "blasphemy",
  "sexual-content",
  "violence",
  "substance-use"
];

export const categoryLabels: Record<FilterCategory, string> = {
  language: "Language",
  blasphemy: "Blasphemy",
  "sexual-content": "Sexual content",
  violence: "Violence",
  "substance-use": "Substance use"
};
