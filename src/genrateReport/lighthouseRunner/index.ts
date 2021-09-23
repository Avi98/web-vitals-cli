import path from "path";
import { spawn } from "child_process";
import { IBaseConfig } from "../../interfaces/baseConfig";
import { log } from "../../utils/log";
import { BASE_BASE_BROWSER_PORT } from "../../utils/consts";

const chromeLauncher = require("chrome-launcher");

interface ILighthouseRunner {
  run: (url: string, options: IBaseConfig) => Promise<any>;
  getLighthousePath: () => any;
}

const isProd = process.env.NODE_ENVIRONMENT === "production";
class LighthouseRunner implements ILighthouseRunner {
  private options: IBaseConfig;
  constructor(options: IBaseConfig) {
    this.options = options;
  }

  async run(url: string, options: IBaseConfig) {
    const headless = [`--quite`, `--chrome-flags="--no-sandbox --headless"`];
    //emits output in Json formate, write out to stdout
    const cliOptions = [
      url,
      "--port",
      BASE_BASE_BROWSER_PORT,
      "--output",
      "json",
      "--output-path",
      "stdout",
      "--screenEmulation.disabled",
    ];

    const op = cliOptions.join(" ");
    console.log("op---->", op);
    if (!options.option.debug) {
      cliOptions.push(...headless);
    }
    if (options.option.chromeCliOptions) {
      cliOptions.push(...options.option.chromeCliOptions);
    }

    if (isProd) {
      cliOptions.push(...headless);
    }

    let resolve: any;
    let reject: any;

    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    console.log("Start--->");
    const lighthouse = this.getLighthousePath();

    const child = spawn("node", [lighthouse, ...cliOptions]);

    let stdout: unknown;
    let stderr: unknown;
    child.stdout.on("data", (result) => {
      stdout += result.toString();
    });

    child.stderr.on("error", (error) => {
      stderr += error.toString();
    });

    child.on("exit", (code) => {
      if (code === 0) return resolve(stdout);

      const error = new Error("Error occurred while running lighthouse");
      // @ts-expect-error
      error.stdout = stdout;
      //@ts-expect-error
      error.stderr = stderr;
      return reject(error);
    });
    return promise;
  }

  getLighthousePath() {
    return path.join(
      require.resolve("lighthouse"),
      "../../lighthouse-cli/index.js"
    );
  }
}
export default LighthouseRunner;
