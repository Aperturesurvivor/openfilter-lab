# OpenFilter Lab to-do

First milestone: a minimal local word-filtering CLI; see [scope.md](scope.md). Josiah expects to work on the likely rewrite personally with Codex.

- [ ] Choose a simple locally runnable Whisper-based tool with estimated word timestamps and document installation and model requirements.
- [ ] Build a CLI that accepts one local video and user-supplied word list, transcribes locally, and writes machine-readable draft mute intervals with configurable padding.
- [ ] Make the output easy to inspect and manually edit; clearly identify transcription uncertainty and file identity.
- [ ] Test using a small labeled fixture; document missed words, false matches, timestamp accuracy, and setup.
- [ ] Document how to run it offline after model installation and its limitations.
- [ ] After results exist, decide the next useful step and an appropriate portfolio artifact.

Later possibilities: applying mute intervals during playback or to audio, a UI, Jellyfin integration, other categories, and shared annotations.
