import fs from "fs";
import rimraf from "rimraf";
import path from "path";

import { IBaseConfig } from "../interfaces/IBaseConfig";
import LighthouseRunner from "./lighthouseRunner";
import PuppeteerMiddleware from "./puppetter";
import StaticServer from "./server";
import { log, messageTypeEnum } from "../utils/log";
import { BASE_REPORT_DIR } from "../utils/consts";
import { GenerateReport } from "./genrateReportTabel";

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
  //@TODO: run lighthouse on this url on number of times
  const maxNumberOfRuns = option.option.maxNumberOfRuns || 3;
  const {
    computeMedianRun,
  } = require("lighthouse/lighthouse-core/lib/median-run.js");

  createReportDirIfNotThere();

  const LIReport = [];
  for (let i = 0; i < maxNumberOfRuns; i++) {
    try {
      const result = await lighthouse.runUntilSuccess(url, option);
      if (result) {
        //@ts-expect-error
        LIReport.push(JSON.parse(result));
      }
    } catch (error) {
      throw error;
    }
  }
  const medianResult = computeMedianRun(LIReport);
  const reportSavePath = path.join(
    process.cwd(),
    BASE_REPORT_DIR,
    `${new Date()}.json`
  );
  const logReport = JSON.stringify(medianResult, null, 2);
  fs.writeFileSync(reportSavePath, logReport, "utf8");

  log(`Done running lighthouse on ${url} `, messageTypeEnum.SUCCESS);
};

/**start serve and get all urls */
const startServerAndGetUrls = async (config: IBaseConfig) => {
  const urls = config.option?.puppeteer?.urls || [];

  const urlArray = Array.isArray(urls) ? urls : [urls];
  const pathToBuildDir = path.join(process.cwd(), config.option.buildPath);

  const server = new StaticServer({
    pathToBuildDir,
    options: config,
  });

  if (!urlArray.length) {
    throw new Error("Need to provide urls to run lighthouse on");
  }

  await server.listen();
  urlArray.forEach((path, i) => {
    const link = new URL(path, "http://localhost");
    link.port = server.portNumber.toString();
    urlArray[i] = link.href;
  });
  return { urls: urlArray, server };
};

const GatherLighthouseData = async (config: IBaseConfig | null) => {
  if (!config) {
    throw new Error("Please provide webvitals config file");
  }
  // delete base dir
  const baseReportDirPath = path.join(process.cwd(), BASE_REPORT_DIR);
  if (baseReportDirPath) {
    rimraf.sync(baseReportDirPath);
  }

  try {
    const puppeteer = new PuppeteerMiddleware(config);
    const reportTable = new GenerateReport(config);
    const { urls, server } = await startServerAndGetUrls(config);
    await puppeteer.invokePuppeteerScript(urls[0]);
    for (let url of urls) {
      // login into the script
      // run lighthouse on every url and store the result
      await runOnUrl(url, config);
      if (config.option.markdown) {
        reportTable.removeMarkdownFile();
        reportTable.createMarkdownTable(url);
      }
    }

    process.send?.({ markdownComment: reportTable.markdownComment });
    server.close();
  } catch (error) {
    console.error(error);
  }

  log("Upload to server", messageTypeEnum.info);
  // uploadReports(config);
};

export default GatherLighthouseData;
