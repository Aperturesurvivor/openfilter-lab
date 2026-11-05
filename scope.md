# OpenFilter Lab scope

## Status

First milestone: a minimal local CLI prototype. Overall project status has not yet been decided.

## Long-term goal

An open-source, self-hosted system for annotating personally held video media, filtering playback according to viewer preferences, and reusing community-contributed annotations for matching editions. See README for the broader vision.

## First milestone

Likely rewrite: build a small CLI, usable by people or agents, that accepts one local video, transcribes its audio locally using a Whisper-based model with estimated word timestamps, matches a user-provided word list, and produces a machine-readable list of suggested mute intervals. Support simple configurable padding and an output that can be inspected and edited as a file. No API key is needed after model installation.

Test the output against a small labeled audio/video fixture; document setup, usage, limitations, and results. The transcription and timestamps are imperfect and may miss or mishear words. Do not claim complete filtering.

Playback integration or generating filtered audio is a follow-up decision: the first CLI proves detection and produces mute intervals. UI, player, Jellyfin integration, additional categories, and shared catalog are later options. Decide the eventual portfolio artifact after results exist.

## Acceptance

A user or agent can run a documented command on a local test video, get timestamped mute intervals for detected list words, inspect the output, and run the test fixture. Document missed words, false matches, and approximate timing on that fixture.

## References

- [whisper.cpp](https://github.com/ggml-org/whisper.cpp) documents local inference and experimental word-level timestamps.
- [jellyfin-whisper](https://github.com/electrovir/jellyfin-whisper) describes a related profanity-filtering approach; not independently tested.
