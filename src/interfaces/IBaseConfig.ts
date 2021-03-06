export interface IPuppeteerLunchOptions extends Record<string, any> {
  executablePath: string;
}

export interface IBaseConfig {
  option: {
    buildPath: string;
    run: number;
    env?: string;
    maxNumberOfRuns?: number;
    headless?: boolean;
    chromeCliOptions: Record<string, boolean>;
    markdown?: boolean;
    markdownPath: string;
    ci?: {
      audits?: ["first-meaningful-paint", "speed-index"];
    };
    puppeteer: {
      urls: string[];
      root?: string;
      loginSelector: {
        emailFieldSelector: string;
        passwordFieldSelector: string;
      };
      loginCredentials: {
        userName: string;
        password: string;
      };
      puppeteerScriptPath?: string;
      puppeteerLunchOptions?: IPuppeteerLunchOptions;
    };
    lighthouseConfig?: any;
    clearReports?: boolean;
  };
}
