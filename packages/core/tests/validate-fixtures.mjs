import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = new URL("../../..", import.meta.url).pathname;
const annotationPath = join(root, "apps/player/public/annotations/openfilter-test-reel.of.json");
const mediaPath = join(root, "apps/player/public/media/openfilter-test-reel.mp4");
const coreUrl = pathToFileURL(join(root, "packages/core/dist/index.js")).href;
const { validateAnnotationShape } = await import(coreUrl);

const annotation = JSON.parse(await readFile(annotationPath, "utf8"));
const errors = validateAnnotationShape(annotation);

if (!existsSync(mediaPath)) {
  errors.push(`sample media missing at ${mediaPath}; run npm run fixture:media`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${annotation.events.length} annotation events and sample media fixture.`);
