import type { FilterProfile } from "./types.js";

export const defaultProfile: FilterProfile = {
  language: { enabled: true, minSeverity: 2, action: "mute" },
  blasphemy: { enabled: true, minSeverity: 1, action: "mute" },
  "sexual-content": { enabled: true, minSeverity: 2, action: "skip" },
  violence: { enabled: true, minSeverity: 4, action: "skip" },
  "substance-use": { enabled: false, minSeverity: 3, action: "skip" }
};

export function cloneProfile(profile: FilterProfile): FilterProfile {
  return JSON.parse(JSON.stringify(profile)) as FilterProfile;
}
