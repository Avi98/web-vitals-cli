import path from "path";
import loginScript from "./loginScript";
import { IBaseConfig } from "../../interfaces/IBaseConfig";
import { log } from "../../utils/log";
import { BASE_BASE_BROWSER_PORT } from "../../utils/consts";
import chalk from "chalk";
export interface IPuppeteerMiddleware {
  getBrowser: () => void;
  getPuppeteer: () => any;
  isActive: () => boolean;
  invokePuppeteerScript: (url: string) => void;
  getBrowserPortNumber: () => number;
}

/**
 * @Todo need to test this with agent-dashborad built, Will this work or not
 */
class PuppeteerMiddleware implements IPuppeteerMiddleware {
  private browser: any;
  private headless: boolean;
  private options: IBaseConfig;
  private isPuppeterActive: boolean;
  private chromePath: string | null;
  private puppeteerOptions: IBaseConfig["option"]["puppeteer"];

  constructor(options: IBaseConfig) {
    this.browser = null;
    this.options = options;
    this.isPuppeterActive = false;
    this.chromePath =
      options.option.puppeteer.puppeteerLunchOptions?.executablePath || null;
    this.headless = options.option.headless || true;
    this.puppeteerOptions = options.option.puppeteer;
  }

  getBrowserPortNumber() {
    const browser = this.browser;
    const port = Number(new URL(browser.wsEndpoint()).port);
    return port;
  }

  getPuppeteer() {
    const requireg = require("requireg");
    return requireg("puppeteer");
  }

  isActive() {
    return (
      Boolean(this.puppeteerOptions.puppeteerScriptPath) ||
      this.isPuppeterActive
    );
  }

  protected getChrome() {
    let chromePath = this.chromePath;
    if (chromePath) return chromePath;

    const location = require("chrome-location");
    chromePath = location;
    process.stdout.write(
      chalk.green(`chrome location found at ----> ${chromePath}\n`)
    );
    return chromePath;
  }

  async getBrowser() {
    const puppeteer = this.getPuppeteer();
    this.browser = await puppeteer.launch({
      executablePath: this.getChrome(),
      ...this.puppeteerOptions.puppeteerLunchOptions,
      pipe: false,
      headless: this.headless,
      timeout: 0,
      // same port as lighthouse runs, since have a login script that needs to be run on the same port
      args: [`--remote-debugging-port=${BASE_BASE_BROWSER_PORT}`],
    });
    return this.browser;
  }

  async invokePuppeteerScript(url: string) {
    const options = this.options;
    if (!this.puppeteerOptions) return;

    const browser = await this.getBrowser();
    const scriptPath = this.puppeteerOptions.puppeteerScriptPath;
    const isLoginRequired = !!this.puppeteerOptions?.loginCredentials;
    // need to invock login script with options passed else invoke script
    try {
      if (!isLoginRequired) return;
      if (scriptPath) {
        const script = require(path.join(process.cwd(), scriptPath));
        log("running provided script ");
        await script(browser, this.puppeteerOptions);
        return;
      }
      // if no coustom script is provided then done run coustom report
      log("login in");
      await loginScript(browser, { ...options, url });
    } catch (error) {
      throw new Error("Error occurred while running the puppeteer");
    }
  }
}

export default PuppeteerMiddleware;
