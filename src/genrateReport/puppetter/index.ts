import path from "path";
import loginScript from "./loginScript";
import { IBaseConfig } from "../../interfaces/IBaseConfig";
import { log } from "../../utils/log";
import { BASE_BASE_BROWSER_PORT } from "../../utils/consts";
export interface IPuppeteerMiddleware {
  getBrowser: () => void;
  getpuppeteer: () => any;
  isActive: () => boolean;
  invokePuppeteerScript: (url: string) => void;
  getBrowserPortNumber: () => number;
}

/**
 * @Todo need to test this with agent-dashborad built, Will this work or not
 */
class PuppeteerMiddleware implements IPuppeteerMiddleware {
  private options: IBaseConfig;
  private browser: any;
  private isPuppeterActive: boolean;
  constructor(options: IBaseConfig) {
    this.options = options;
    this.browser = null;
    this.isPuppeterActive = false;
  }

  getBrowserPortNumber() {
    const browser = this.browser;
    const port = Number(new URL(browser.wsEndpoint()).port);
    return port;
  }

  /**
   *
   * @todo
   * 1. remove puppeteer dependency from this folder
   * 2. import it from current project
   */
  getpuppeteer() {
    return require("puppeteer");
  }

  isActive() {
    return (
      Boolean(this.options.option.puppeteer.puppeteerScriptPath) ||
      this.isPuppeterActive
    );
  }

  async getBrowser() {
    const puppeteer = this.getpuppeteer();
    this.browser = await puppeteer.launch({
      ...this.options.option.puppeteer.puppeteerLunchOptions,
      pipe: false,
      headless: !this.options.option.headless,

      timeout: 0,
      args: [`--remote-debugging-port=${BASE_BASE_BROWSER_PORT}`],
    });
    return this.browser;
  }

  async invokePuppeteerScript(url: string) {
    if (!this.options.option.puppeteer) return;
    const options = this.options;
    const browser = await this.getBrowser();
    const scriptPath = this.options.option.puppeteer.puppeteerScriptPath;
    const isLoginRequired = !!this.options.option.puppeteer?.loginCredentials;
    // need to invock login script with options passed else invoke script
    try {
      if (!isLoginRequired) return;
      if (scriptPath) {
        const script = require(path.join(process.cwd(), scriptPath));
        log("running provided script ");
        await script(browser, options);
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
