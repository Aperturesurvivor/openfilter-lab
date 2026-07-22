export type AnnotateOptions = {
  input: string;
  title?: string;
  year?: number | null;
  edition: string;
  out: string;
  workDir: string;
  sampleFrames: boolean;
  frameEverySeconds: number;
  classifyFrames: boolean;
  visionProvider: "gemini" | "mock";
  geminiModel: string;
  maxFrames: number;
};

export function parseArgs(argv: string[]): AnnotateOptions {
  const [command, input, ...rest] = argv;
  if (command !== "annotate" || !input) {
    throw new Error(helpText());
  }

  const options: AnnotateOptions = {
    input,
    edition: "local media file",
    out: "movie.of.json",
    workDir: ".openfilter-work",
    sampleFrames: false,
    frameEverySeconds: 5,
    classifyFrames: false,
    visionProvider: "gemini",
    geminiModel: "gemini-3.5-flash",
    maxFrames: 24
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    const next = rest[index + 1];

    switch (arg) {
      case "--title":
        options.title = requireValue(arg, next);
        index += 1;
        break;
      case "--year":
        options.year = Number(requireValue(arg, next));
        if (!Number.isInteger(options.year)) throw new Error("--year must be an integer");
        index += 1;
        break;
      case "--edition":
        options.edition = requireValue(arg, next);
        index += 1;
        break;
      case "--out":
        options.out = requireValue(arg, next);
        index += 1;
        break;
      case "--work-dir":
        options.workDir = requireValue(arg, next);
        index += 1;
        break;
      case "--sample-frames":
        options.sampleFrames = true;
        break;
      case "--frame-every":
        options.frameEverySeconds = Number(requireValue(arg, next));
        if (!Number.isFinite(options.frameEverySeconds) || options.frameEverySeconds <= 0) {
          throw new Error("--frame-every must be a positive number of seconds");
        }
        index += 1;
        break;
      case "--classify-frames":
        options.classifyFrames = true;
        options.sampleFrames = true;
        break;
      case "--vision-provider":
        options.visionProvider = requireValue(arg, next) as AnnotateOptions["visionProvider"];
        if (!["gemini", "mock"].includes(options.visionProvider)) {
          throw new Error("--vision-provider must be gemini or mock");
        }
        index += 1;
        break;
      case "--gemini-model":
        options.geminiModel = requireValue(arg, next);
        index += 1;
        break;
      case "--max-frames":
        options.maxFrames = Number(requireValue(arg, next));
        if (!Number.isInteger(options.maxFrames) || options.maxFrames <= 0) {
          throw new Error("--max-frames must be a positive integer");
        }
        index += 1;
        break;
      case "--help":
      case "-h":
        throw new Error(helpText());
      default:
        throw new Error(`Unknown option ${arg}\n\n${helpText()}`);
    }
  }

  return options;
}

function requireValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

export function helpText(): string {
  return `Usage:
  openfilter annotate <movie-file> --title "Movie Title" --edition "DVD NTSC rip" --out movie.of.json

Options:
  --title <title>          Media title. Defaults to the filename.
  --year <year>            Release year when known.
  --edition <label>        Edition/cut/source label.
  --out <path>             Draft annotation output path.
  --work-dir <path>        Working directory for extracted assets.
  --sample-frames          Extract frame samples for later vision classification.
  --frame-every <seconds>  Sampling interval when --sample-frames is set.
  --classify-frames        Run the frame classifier and merge candidate events.
  --vision-provider <name> gemini or mock. Defaults to gemini.
  --gemini-model <model>   Gemini model ID. Defaults to gemini-3.5-flash.
  --max-frames <count>     Maximum sampled frames sent to the vision provider.`;
}
