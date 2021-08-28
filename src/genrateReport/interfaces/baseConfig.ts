export interface IBaseConfig {
  option: {
    buildPath: string;
    urls: string[];
    run: number;
    loginScriptPath: string;
    lightouseConfig: any;
  };
}
