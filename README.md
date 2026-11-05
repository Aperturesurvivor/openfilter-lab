# OpenFilter Lab

OpenFilter Lab is an experimental architecture spike for a portable,
self-hosted, VidAngel-style filtering system for videos people already have,
including personal video files and media from DVDs.

## Product vision

The intended system has three connected parts:

1. **Annotation toolkit:** Analyze a video using configurable AI tools and
   user-provided API keys or local models, producing timestamped annotations
   for categories such as language, sexual content, nudity, and violence. The
   aim is a broad, user-configurable set of categories. Automated results need
   review and do not guarantee complete coverage.
2. **Playback and preferences:** Let viewers choose which categories or
   severities to mute or skip while playing their own videos. A self-hosted
   home-media integration, potentially a Jellyfin plugin, is one possible
   direction; the integration and player are not yet decided.
3. **Shared annotation catalog:** Let contributors publish and discover
   annotation files so others can reuse work for the same video edition and
   matching media. The system should check whether a file matches an annotation
   before applying it. Disc editions, encodes, and timing differences make
   reliable matching an open design problem; shared files should include
   provenance and review coverage.

These are goals, not completed features. Model providers, the category set,
matching approach, hosting, and community review mechanisms remain to be
specified. Local operation is a goal; optional external AI services require
network access and may receive selected media data.

The project record, motivation, and current limitations are documented at
<https://josiahwilson.me/projects/openfilter-lab/>.

The important artifact is the OpenFilter annotation file (`.of.json`): a small
sidecar document with media matching metadata, timestamped events, categories,
severities, actions, source provenance, and review coverage.

## Repository layout

```text
packages/core
  Shared schema types, validation, profile decisions, interval merging, and
  draft annotation factories.

apps/annotator-cli
  Raw annotation pipeline skeleton. It probes local media with ffprobe, creates
  a fingerprint, optionally samples frames with ffmpeg, and writes a draft
  .of.json plus a work manifest. It can also run a first vision classifier pass
  over sampled frames.

apps/player
  Local browser test harness. It consumes .of.json annotations and applies
  VidAngel-style mute/skip controls to an HTML video player.
```

## Run the player

```bash
npm install
npm run fixture:media
npm run dev
```

Then open the Vite URL. The sample reel proves that annotation events plus a
profile can drive live mute/skip behavior.

## Build and test

```bash
npm test
npm run build
```

## Try the annotator CLI

```bash
npm run build -w @openfilter/core
npm run build -w @openfilter/annotator-cli
node apps/annotator-cli/dist/index.js annotate \
  apps/player/public/media/openfilter-test-reel.mp4 \
  --title "OpenFilter Test Reel" \
  --edition "generated fixture" \
  --out /tmp/openfilter-test-reel.of.json \
  --work-dir /tmp/openfilter-work \
  --sample-frames
```

For an offline classifier smoke test:

```bash
node apps/annotator-cli/dist/index.js annotate \
  apps/player/public/media/openfilter-test-reel.mp4 \
  --title "OpenFilter Test Reel" \
  --edition "generated fixture" \
  --out /tmp/openfilter-classified.of.json \
  --work-dir /tmp/openfilter-classifier-work \
  --classify-frames \
  --vision-provider mock \
  --frame-every 10
```

For Gemini frame classification:

```bash
export GEMINI_API_KEY="..."
node apps/annotator-cli/dist/index.js annotate \
  movie.mkv \
  --title "Movie Title" \
  --edition "DVD rip" \
  --out movie.of.json \
  --work-dir .openfilter-work/movie \
  --classify-frames \
  --vision-provider gemini \
  --gemini-model gemini-3.5-flash \
  --frame-every 5 \
  --max-frames 24
```

The CLI now creates the deterministic backbone and a first vision-pass candidate
layer:

```text
video -> ffprobe metadata -> fingerprint -> optional frame samples
      -> Gemini/mock visual detections -> event candidates
      -> normalized draft annotation -> manifest for review passes
```

Vision-generated events are not final annotations. They are draft candidates
that should go through a review UI before publication.

This repository is an experimental implementation, not a promise that every
undesired moment will be detected or filtered. Reliable use depends on edition
matching, review coverage, and transparent handling of uncertain annotations.

## AI workflow target

The next pipeline stages should be replaceable modules:

- embedded subtitle extraction
- local Whisper transcription when subtitles are missing
- transcript-window classification for speech categories
- Gemini/vision-model classification over sampled frames
- event smoothing and scene-boundary alignment
- human review UI for final publication

That keeps Gemini, local models, Jellyfin, Kodi, browser extensions, and the
review app as consumers/producers around the same portable annotation standard.
