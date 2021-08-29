import path from "path";

import { IBaseConfig } from "./interfaces/baseConfig";
import StaticServer from "./server";

const startServer = (config: IBaseConfig) => {
  const pathToBuildDir = path.join(process.cwd(), config.option.buildPath);
  const server = new StaticServer({ pathToBuildDir, options: config });
  server.listen();
};

/**
 * Start server
 * run puppetter script for login
 * run lighthouse on each of the urls provided on number of times its there in config
 * save lighthouse data
 */
const GatherLighthouseData = async (config: IBaseConfig) => {
  if (!config) {
    throw new Error("Please provide webvitals config file");
  }
  startServer(config);
};

export default GatherLighthouseData;
