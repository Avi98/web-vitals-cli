import path from "path";
import loginScript from "./loginScript";
import { IBaseConfig } from "../../interfaces/baseConfig";
import { log } from "../../utils/log";
import { BASE_BASE_BROWSER_PORT } from "../../utils/consts";
export interface IPuppetterMiddleware {
  getBrowser: () => void;
  getPuppetter: () => any;
  isActive: () => boolean;
  invokePuppetterScript: (url: string) => void;
  getBrowserPortNumber: () => number;
}

/**
 * @Todo need to test this with agent-dashborad built, Will this work or not
 */
class PuppetterMiddleware implements IPuppetterMiddleware {
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
   * 1. remove puppetter dependency from this folder
   * 2. import it from current project
   */
  getPuppetter() {
    return require("puppeteer");
  }

  isActive() {
    return (
      Boolean(this.options.option.puppetter.puppetterScriptPath) ||
      this.isPuppeterActive
    );
  }

  async getBrowser() {
    const puppeteer = this.getPuppetter();
    this.browser = await puppeteer.launch({
      ...this.options.option.puppetter.puppetterLunchOptions,
      pipe: false,
      headless: false,

      timeout: 0,
      args: [`--remote-debugging-port=${BASE_BASE_BROWSER_PORT}`],
    });
    return this.browser;
  }

  async invokePuppetterScript(url: string) {
    if (!this.options.option.puppetter) return;
    const options = this.options;
    const browser = await this.getBrowser();
    const scriptPath = this.options.option.puppetter.puppetterScriptPath;
    const isLoginRequired = !!this.options.option.puppetter?.loginCredentionals;
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
      throw new Error("Error occurred while running the puppeter");
    }
  }
}

export default PuppetterMiddleware;
