export interface IBaseConfig {
  option: {
    buildPath: string;
    run: number;
    env?: string;
    maxNumberOfRuns?: number;
    debug?: boolean;
    chromeCliOptions: string[];
    ci: {};
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
      puppeteerLunchOptions?: any;
    };
    lighthouseConfig?: any;
    clearReports?: boolean;
  };
}
