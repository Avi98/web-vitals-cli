import path from "path";
import loginScript from "./loginScript";
import { IBaseConfig } from "../interfaces/baseConfig";
export interface IPuppetterMiddleware {
  getBrowser: () => void;
  getPuppetter: () => any;
  isActive: () => boolean;
  invokePuppetterScript: () => void;
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
      headless:
        this.options.option.puppetter?.puppetterLunchOptions?.headeless || true,
    });
    return this.browser;
  }

  async invokePuppetterScript() {
    if (!this.options.option.puppetter) return;
    const options = this.options;
    const browser = await this.getBrowser();
    const scriptPath = this.options.option.puppetter.puppetterScriptPath;
    const isLoginRequired = !!this.options.option.puppetter?.loginCredentionals;
    // need to invock login script with options passed else invoke script
    if (!!isLoginRequired) return;
    if (scriptPath) {
      const script = require(path.join(process.cwd(), scriptPath));
      await script(browser, options);
      return;
    }
    // if no coustom script is provided then done run coustom report
    await loginScript(browser, options);
  }
}

export default PuppetterMiddleware;
