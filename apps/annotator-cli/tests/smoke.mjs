import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = new URL("../../..", import.meta.url).pathname;
const fixture = join(root, "apps/player/public/media/openfilter-test-reel.mp4");
const temp = await mkdtemp(join(tmpdir(), "openfilter-cli-"));
const out = join(temp, "draft.of.json");
const workDir = join(temp, "work");
const classifiedOut = join(temp, "classified.of.json");
const classifiedWorkDir = join(temp, "classified-work");

try {
  if (!existsSync(fixture)) {
    throw new Error(`Missing fixture media at ${fixture}`);
  }

  await execFileAsync("node", [
    join(root, "apps/annotator-cli/dist/index.js"),
    "annotate",
    fixture,
    "--title",
    "OpenFilter Test Reel",
    "--edition",
    "generated fixture",
    "--out",
    out,
    "--work-dir",
    workDir
  ]);

  const annotation = JSON.parse(await readFile(out, "utf8"));
  if (annotation.media.title !== "OpenFilter Test Reel") {
    throw new Error("CLI did not preserve title");
  }
  if (annotation.events.length !== 0) {
    throw new Error("Initial CLI draft should not invent events before classifiers run");
  }
  if (!existsSync(join(workDir, "manifest.json"))) {
    throw new Error("CLI did not write manifest");
  }

  await execFileAsync("node", [
    join(root, "apps/annotator-cli/dist/index.js"),
    "annotate",
    fixture,
    "--title",
    "OpenFilter Test Reel",
    "--edition",
    "generated fixture",
    "--out",
    classifiedOut,
    "--work-dir",
    classifiedWorkDir,
    "--classify-frames",
    "--vision-provider",
    "mock",
    "--frame-every",
    "10"
  ]);

  const classifiedAnnotation = JSON.parse(await readFile(classifiedOut, "utf8"));
  if (classifiedAnnotation.events.length !== 1) {
    throw new Error("Mock vision classification should create one merged event");
  }
  if (!existsSync(join(classifiedWorkDir, "frame-samples.json"))) {
    throw new Error("Frame sample manifest missing");
  }
  if (!existsSync(join(classifiedWorkDir, "candidates/vision-frame-candidates.json"))) {
    throw new Error("Vision candidates file missing");
  }

  console.log("Annotator CLI smoke test passed.");
} finally {
  await rm(temp, { recursive: true, force: true });
}
