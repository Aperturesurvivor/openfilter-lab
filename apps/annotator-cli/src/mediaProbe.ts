import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";
import { basename } from "node:path";
import { promisify } from "node:util";
import { secondsToMs, type MediaFingerprint } from "@openfilter/core";

const execFileAsync = promisify(execFile);

type FfprobeOutput = {
  format?: {
    duration?: string;
    size?: string;
    format_name?: string;
  };
  streams?: Array<{
    codec_type?: string;
    codec_name?: string;
    width?: number;
    height?: number;
    duration?: string;
    tags?: Record<string, string>;
  }>;
  chapters?: Array<{
    start_time?: string;
  }>;
};

export type MediaProbeResult = {
  runtimeMs: number;
  fingerprint: MediaFingerprint;
  formatName: string;
  videoSummary: string;
  audioSummary: string;
};

export async function probeMedia(input: string): Promise<MediaProbeResult> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    "-show_chapters",
    input
  ]);

  const parsed = JSON.parse(stdout) as FfprobeOutput;
  const durationSeconds = Number(parsed.format?.duration ?? firstStreamDuration(parsed) ?? 0);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error("Could not determine media duration with ffprobe");
  }

  const fileStat = await stat(input);
  const sourceId = createHash("sha256")
    .update(basename(input))
    .update(String(fileStat.size))
    .update(String(fileStat.mtimeMs))
    .update(String(parsed.format?.duration ?? ""))
    .digest("hex")
    .slice(0, 24);

  const videoStreams = parsed.streams?.filter((stream) => stream.codec_type === "video") ?? [];
  const audioStreams = parsed.streams?.filter((stream) => stream.codec_type === "audio") ?? [];

  return {
    runtimeMs: secondsToMs(durationSeconds),
    fingerprint: {
      sourceId,
      durationMs: secondsToMs(durationSeconds),
      chapterStartsMs:
        parsed.chapters?.map((chapter) => secondsToMs(Number(chapter.start_time ?? 0))) ?? [],
      videoHash: summarizeStreams(videoStreams),
      audioHash: summarizeStreams(audioStreams)
    },
    formatName: parsed.format?.format_name ?? "unknown",
    videoSummary: summarizeStreams(videoStreams),
    audioSummary: summarizeStreams(audioStreams)
  };
}

function firstStreamDuration(output: FfprobeOutput): string | undefined {
  return output.streams?.find((stream) => stream.duration)?.duration;
}

function summarizeStreams(streams: NonNullable<FfprobeOutput["streams"]>): string {
  if (streams.length === 0) return "none";
  return streams
    .map((stream) => {
      const dimensions = stream.width && stream.height ? `${stream.width}x${stream.height}` : "";
      const language = stream.tags?.language ? `:${stream.tags.language}` : "";
      return [stream.codec_type, stream.codec_name, dimensions].filter(Boolean).join("/") + language;
    })
    .join(",");
}
