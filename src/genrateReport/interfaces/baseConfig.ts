export interface IBaseConfig {
  option: {
    buildPath: string;
    run: number;
    env?: string;
    puppetter: {
      urls: string[];
      root?: string;
      loginSelector: {
        emailFieldSelector: string;
        passwordFieldSelector: string;
      };
      loginCredentionals: {
        userName: string;
        password: string;
      };
      puppetterScriptPath?: string;
      puppetterLunchOptions?: any;
    };
    lightouseConfig?: any;
    clearReports?: boolean;
  };
}
