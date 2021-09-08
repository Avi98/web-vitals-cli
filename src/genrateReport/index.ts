import path from "path";
import fs from "fs";

import { IBaseConfig } from "./interfaces/baseConfig";
import LighthouseRunner from "./lighthouseRunner";
import PuppetterMiddleware, { IPuppetterMiddleware } from "./puppetter";
import StaticServer from "./server";
import { log } from "./utils/log";

const startServer = async (config: IBaseConfig) => {};

const BASE_REPORT_DIR = "WEB_VITALS_REPORT";
type isReportDirExisitsType = () => void;
const createReportDirIfNotThere: isReportDirExisitsType = () => {
  const filePath = path.join(process.cwd(), `/${BASE_REPORT_DIR}`);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
};
/**
 * check/makdir for saving lighthouse reports
 * save it in there
 * run lighthouse 3 times
 * after writing to those dir close server
 *
 */
const runOnUrl = async (url: string, option: IBaseConfig) => {
  const lighthouse = new LighthouseRunner(option);
  const maxNumberOfRuns = option.option.maxNumberOfRuns || 3;

  createReportDirIfNotThere();
  log(`Running lighthouse on ${url}`);
  // for (let i = 0; i <= maxNumberOfRuns; i++) {
  try {
    const result: any = await lighthouse.run(url, option);
    const reportSavePath = path.join(
      process.cwd(),
      BASE_REPORT_DIR,
      `${new Date()}.json`
    );
    if (result) fs.writeFileSync(reportSavePath, result);
  } catch (error: any) {
    process.stderr.write(error);
  }
  // }
};

/**start serve and get all urls */
const startServerAndGetUrls = async (config: IBaseConfig) => {
  const urls = config.option?.puppetter?.urls || [];
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const pathToBuildDir = path.join(process.cwd(), config.option.buildPath);

  const server = new StaticServer({
    pathToBuildDir,
    options: config,
  });

  if (!urlArray.length) {
    throw new Error("Need to provide path for the errors");
  }

  await server.listen();
  console.log("port-->", server.portNumber);
  urlArray.forEach((path, i) => {
    const link = new URL(path, "http://localhost");
    link.port = server.portNumber.toString();
    urlArray[i] = link.href;
  });
  return { urls: urlArray, server };
};

const GatherLighthouseData = async (config: IBaseConfig) => {
  if (!config) {
    throw new Error("Please provide webvitals config file");
  }
  const puppeteer = new PuppetterMiddleware(config);
  const { urls, server } = await startServerAndGetUrls(config);

  for (let url of urls) {
    // login into the script
    await puppeteer.invokePuppetterScript();
    // run lighthouse on every url and store the result
    await runOnUrl(url, config);
  }
  server.close();
};

export default GatherLighthouseData;
