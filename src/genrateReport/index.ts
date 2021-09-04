import { Server } from "http";
import { url } from "inspector";
import path from "path";

import { IBaseConfig } from "./interfaces/baseConfig";
import PuppetterMiddleware, { IPuppetterMiddleware } from "./puppetter";
import StaticServer from "./server";

const startServer = async (config: IBaseConfig) => {
  const pathToBuildDir = path.join(process.cwd(), config.option.buildPath);
  const server = new StaticServer({ pathToBuildDir, options: config });
  await server.listen();
  return server;
};

const runOnUrl = async (url: string) => {};

/**start serve and get all urls */
const startServerAndGetUrls = async (config: IBaseConfig) => {
  const urls = config.option?.puppetter?.urls || [];
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const server = await startServer(config);
  if (!urlArray.length) {
    throw new Error("Need to provide path for the errors");
  }

  urlArray.forEach((path, i) => {
    const link = new URL(path, "http://localhost");
    link.port = server.portNumber.toString();
    urlArray[i] = link.href;
  });

  return { urls: urlArray };
};
/**
 * run puppetter script for login
 * run lighthouse on each of the urls provided on number of times its there in config
 * save lighthouse data
 */
const GatherLighthouseData = async (config: IBaseConfig) => {
  if (!config) {
    throw new Error("Please provide webvitals config file");
  }
  const puppeteer = new PuppetterMiddleware(config);
  const { urls } = await startServerAndGetUrls(config);

  for (let url in urls) {
    // login into the script
    await puppeteer.invokePuppetterScript();
    // run lighthouse on every url and store the result
    await runOnUrl(url);
  }
};

export default GatherLighthouseData;
