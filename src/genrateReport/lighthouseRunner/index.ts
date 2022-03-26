import path from "path";
import { spawn } from "child_process";
import { IBaseConfig } from "../../interfaces/IBaseConfig";
import { BASE_BASE_BROWSER_PORT } from "../../utils/consts";
interface ILighthouseRunner {
  run: (url: string, options: IBaseConfig) => Promise<any>;
  getLighthousePath: () => any;
}

const getChromeFlags = (cliOptions: Record<string, boolean>) => {
  const chromeFlags = Object.keys(cliOptions)
    .map((flags) => cliOptions[flags] && flags)
    .join(",");

  return chromeFlags;
};

class LighthouseRunner implements ILighthouseRunner {
  private options: IBaseConfig;
  constructor(options: IBaseConfig) {
    this.options = options;
  }

  async run(url: string, options: IBaseConfig) {
    //emits output in Json formate, write out to stdout

    const cliOptions = [
      url,
      "--port",
      BASE_BASE_BROWSER_PORT,
      "--output",
      "json",
      "--output-path",
      "stdout",
      `--chrome-flags=${getChromeFlags(options.option.chromeCliOptions)}`,
    ];

    let resolve: unknown;
    let reject: unknown;

    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const lighthouse = this.getLighthousePath();

    const child = spawn("node", [lighthouse, ...cliOptions]);

    let stdout: unknown = "";
    let stderr: unknown = "";
    child.stdout.on("data", (result = "") => {
      stdout += result.toString();
    });

    child.stderr.on("error", (error) => {
      stderr += error.toString();
      console.error(error);
    });

    child.on("exit", (code) => {
      if (code === 0 && typeof resolve === "function") return resolve(stdout);

      const error = new Error("Error occurred while running lighthouse");
      // @ts-expect-error
      error.stdout = stdout;
      //@ts-expect-error
      error.stderr = stderr;
      return typeof reject === "function" && reject(error);
    });
    return promise;
  }

  getLighthousePath() {
    return path.join(
      require.resolve("lighthouse"),
      "../../lighthouse-cli/index.js"
    );
  }

  async runUntilSuccess(url: string, options: IBaseConfig) {
    const attempts = [];
    while (attempts.length < 3) {
      try {
        return await this.run(url, options);
      } catch (e) {
        attempts.push(e);
      }
    }
    throw attempts[0];
  }
}
export default LighthouseRunner;
