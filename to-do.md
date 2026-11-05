# OpenFilter Lab to-do

First milestone: local profanity filtering for one video. See [scope.md](scope.md). Tasks are unchecked until verified.

- [ ] Plan a likely rewrite for the first milestone, using existing work as reference where useful; decide the new structure and preserve prior work while developing.
- [ ] Compare suitable locally runnable Whisper-based transcription options for word timestamps, installation, supported platforms, model licensing, speed, and resource requirements; choose and document one for the prototype.
- [ ] Extract audio from a local video and transcribe it locally with estimated word timestamps. Document model setup and offline operation after downloads.
- [ ] Match a user-configurable word list against transcript words and generate draft mute events, with adjustable boundary padding; save them in the sidecar format.
- [ ] Provide a minimal way to review and correct event timestamps and matches before playback; preserve review status.
- [ ] Connect saved annotations and filter settings to the existing player; support muting, seeking into and out of intervals, overlapping intervals, and restoring audio state.
- [ ] Check file identity before applying annotations and warn clearly on mismatch or unknown coverage.
- [ ] Create or use a suitable labeled test fixture; test matching and playback, and measure missed words, false matches, timing accuracy, and extra muted audio. Document hardware, model, and limitations.
- [ ] Document setup and end-to-end use, including that automated transcription may miss or mishear speech and filtering is not guaranteed complete.
- [ ] Once results are available, decide what portfolio artifact accurately represents the project.

Later: other content categories, Jellyfin integration, and shared annotation catalog; see scope.
