# OpenFilter Lab scope

## Status

Proposed scope for discussion; project status and milestones are not yet decided.

## Long-term goal

A self-hosted, open-source system for annotating personally held video media, filtering playback according to viewer preferences, and reusing community-contributed annotations for matching editions. See README for the broader vision.

## Proposed first milestone: one local end-to-end workflow

- Import a local video and create or load a versioned annotation sidecar with explicit media identity, timed events, category, action, provenance, and review coverage.
- Provide a simple way to inspect, correct, add, and remove annotations and configure category preferences.
- Play the video in the existing browser test player and apply selected mute and skip events, including overlapping events and seeking into an event.
- Support at least one optional AI-assisted draft annotation path; clearly mark its results as unreviewed and identify any external data transfer. Manual annotations remain usable without an AI service.
- Demonstrate the full flow with a generated or otherwise suitable public test fixture, and document setup, limitations, and tests.
- Define a portfolio artifact after the outcome and evidence are known.

## Acceptance questions

Can a user create and correct annotations, save and reload them, and see the selected actions occur at the right times on a matching test video? Do mismatched files or unknown coverage produce an explicit warning rather than an assumption of coverage? Are AI drafts distinguished from human-reviewed entries? Validate with repeatable playback and seek tests and document their limits.

## Later exploration

Jellyfin integration and client support for skipping and muting; a shared online catalog, contribution and moderation, secure distribution, and matching across editions or re-encodes; broader categories and multiple AI providers. These are long-term goals, not promised in the first milestone.

## Research notes

- [Jellyfin Intro Skipper](https://github.com/intro-skipper/intro-skipper) demonstrates segment skipping, but behavior depends on client support.
- [jellyfin-whisper](https://github.com/electrovir/jellyfin-whisper) describes transcription-based profanity filtering via generated audio tracks.
- [Movie Content Filter Jellyfin plugin](https://github.com/jacob-willden/jellyfin-plugin-moviecontentfilter) is a relevant overlapping project to compare in more detail.
- [OpenSubtitles hash reference](https://opensubtitles.github.io/oshash/) explains a fast file-matching hash that is not collision-resistant; matching identical files and matching different encodes of the same edition are distinct problems.

These projects were identified through documentation, not independently tested. Neither AI detection nor an annotation file guarantees complete filtering.
