#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { createDraftAnnotation, normalizeEventCandidates, validateAnnotationShape } from "@openfilter/core";
import { parseArgs } from "./args.js";
import { classifyFramesGemini } from "./geminiVisionClassifier.js";
import { sampleFrames, type FrameSample } from "./frameSampler.js";
import { probeMedia } from "./mediaProbe.js";
import { classifyFramesMock } from "./mockVisionClassifier.js";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const input = resolve(options.input);
  const out = resolve(options.out);
  const workDir = resolve(options.workDir);
  const title = options.title ?? basename(input).replace(/\.[^.]+$/, "");

  const probe = await probeMedia(input);
  await mkdir(dirname(out), { recursive: true });
  await mkdir(workDir, { recursive: true });

  let frameSamples: FrameSample[] = [];
  if (options.sampleFrames) {
    frameSamples = await sampleFrames(input, workDir, options.frameEverySeconds);
  }

  const annotation = createDraftAnnotation({
    title,
    year: options.year ?? null,
    edition: options.edition,
    runtimeMs: probe.runtimeMs,
    sourceUrl: input,
    fingerprint: probe.fingerprint
  });

  let visionCandidateCount = 0;
  if (options.classifyFrames) {
    const classifierInput = {
      samples: frameSamples,
      mediaTitle: title,
      frameWindowMs: Math.round(options.frameEverySeconds * 1000)
    };
    const visionResult =
      options.visionProvider === "mock"
        ? await classifyFramesMock(classifierInput)
        : await classifyFramesGemini(classifierInput, {
            apiKey: process.env.GEMINI_API_KEY ?? "",
            model: options.geminiModel,
            maxFrames: options.maxFrames
          });

    visionCandidateCount = visionResult.candidates.length;
    await mkdir(resolve(workDir, "candidates"), { recursive: true });
    await writeFile(
      resolve(workDir, "candidates/vision-frame-candidates.json"),
      `${JSON.stringify(
        {
          provider: options.visionProvider,
          model: options.visionProvider === "gemini" ? options.geminiModel : "mock",
          detections: visionResult.detections,
          candidates: visionResult.candidates
        },
        null,
        2
      )}\n`
    );

    annotation.events = normalizeEventCandidates(visionResult.candidates, annotation.media.runtimeMs, {
      padStartMs: 750,
      padEndMs: 1250,
      mergeGapMs: 1500
    });
  }

  const errors = validateAnnotationShape(annotation);
  if (errors.length > 0) {
    throw new Error(`Draft annotation failed validation:\n${errors.join("\n")}`);
  }

  await writeFile(out, `${JSON.stringify(annotation, null, 2)}\n`);

  const manifest = {
    input,
    out,
    workDir,
    framesDir: frameSamples.length > 0 ? resolve(workDir, "frames") : null,
    frameSampleCount: frameSamples.length,
    visionProvider: options.classifyFrames ? options.visionProvider : null,
    visionCandidateCount,
    annotationEventCount: annotation.events.length,
    runtimeMs: probe.runtimeMs,
    formatName: probe.formatName,
    videoSummary: probe.videoSummary,
    audioSummary: probe.audioSummary,
    nextPasses: [
      "extract embedded subtitles",
      "transcribe audio when subtitles are missing",
      "classify transcript windows",
      "classify sampled frames with a vision model",
      "merge candidates into reviewed OpenFilter events"
    ]
  };
  await writeFile(resolve(workDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Wrote ${out}`);
  console.log(`Wrote ${resolve(workDir, "manifest.json")}`);
  if (frameSamples.length > 0) console.log(`Sampled ${frameSamples.length} frames into ${resolve(workDir, "frames")}`);
  if (options.classifyFrames) {
    console.log(`Vision candidates: ${visionCandidateCount}`);
    console.log(`Merged annotation events: ${annotation.events.length}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
