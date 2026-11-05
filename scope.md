# OpenFilter Lab scope

## Status

The first milestone is agreed: a local profanity-filtering prototype. Overall project status has not yet been decided.

## Long-term goal

A self-hosted, open-source system for annotating personally held video media, filtering playback according to viewer preferences, and reusing community-contributed annotations for matching editions. See README for the broader vision.

## First milestone: local word filtering

- Accept one local video and transcribe its audio locally with a Whisper-based model that provides estimated word-level timestamps. No API key or external transcription service is required after the model is installed.
- Match transcribed words against a user-configurable filter list and produce draft, timestamped mute annotations in the existing sidecar format.
- Allow review and correction of detected mute intervals and configurable padding around word boundaries.
- Play the video in the existing browser test player and mute the selected intervals; support saving and reloading the annotations.
- Demonstrate the workflow with a suitable test fixture, document setup and known limitations, and test word matching, intervals, and playback including seeking.
- Define the eventual portfolio artifact after results are available; do not assume its final form.

## Acceptance and evidence

A user can process a test video locally, inspect and correct detections, save and reload the sidecar, and hear matching words muted during playback. Check that annotations correspond to the intended file, handle seeking and overlapping intervals, and report missed words, false matches, timing errors and extra muted audio on a labeled test sample. Word timestamps are estimates; speech recognition may miss or mishear words, particularly with overlapping dialogue or background sound. No claim of complete filtering.

## Later exploration

Subtitle-based detection; additional content categories and visual models; Jellyfin integration and client support for muting; a shared annotation catalog, contribution and moderation, and matching across editions or re-encodes. These are long-term ideas rather than requirements for the first milestone.

## Research notes

- [whisper.cpp](https://github.com/ggml-org/whisper.cpp) supports local inference and documents experimental word-level timestamps.
- [jellyfin-whisper](https://github.com/electrovir/jellyfin-whisper) describes a related local-transcription profanity-filtering approach and merits comparison.
- [Jellyfin Intro Skipper](https://github.com/intro-skipper/intro-skipper) demonstrates segment skipping; client behavior varies.
- [Movie Content Filter Jellyfin plugin](https://github.com/jacob-willden/jellyfin-plugin-moviecontentfilter) is another overlapping project to examine.
- [OpenSubtitles hash reference](https://opensubtitles.github.io/oshash/) describes fast file matching; identical files and different encodes with the same timing are distinct matching problems.

Related tools were identified from documentation, not independently tested.
