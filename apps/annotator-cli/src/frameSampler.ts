import { execFile } from "node:child_process";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type FrameSample = {
  path: string;
  timestampMs: number;
  index: number;
};

export async function sampleFrames(input: string, workDir: string, everySeconds: number): Promise<FrameSample[]> {
  const framesDir = join(workDir, "frames");
  await mkdir(framesDir, { recursive: true });

  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    input,
    "-vf",
    `fps=1/${everySeconds}`,
    "-q:v",
    "3",
    join(framesDir, "frame_%06d.jpg")
  ]);

  const files = (await readdir(framesDir))
    .filter((file) => /^frame_\d+\.jpg$/.test(file))
    .sort();

  const samples = files.map((file, index) => ({
    path: join(framesDir, file),
    timestampMs: Math.round(index * everySeconds * 1000),
    index: index + 1
  }));

  await writeFile(join(workDir, "frame-samples.json"), `${JSON.stringify(samples, null, 2)}\n`);
  return samples;
}
