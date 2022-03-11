#!/usr/bin/env node

import GatherLighthouseData from "./genrateReport";
import { IBaseConfig } from "./interfaces/IBaseConfig";
const path = require("path");
const chalk = require("chalk");
const figlet = require("figlet");
const Commander = require("commander");
require("dotenv").config();

let filePath;
let options: IBaseConfig | null = null;

const program = new Commander.Command();
program
  .option(
    "-d, --debug",
    "run the cli in debug mode print all the console log errors along with the markdown"
  )
  .option("-h --headfull", "run the lighthouse in browser")
  .option("-m --markdown", "generate markdown with summary report.")
  .option("-r --medianRun <run>", "number of median runs needs to perform")
  .option(
    "-f --configFilePath <string>",
    "configFile path based on which the file is"
  )
  .option(
    "-f --commentFilePath <string>",
    "comment file path ci.audits are going to be written"
  );

program.parse(process.argv);
const defaultOutMarkdown = path.join(process.cwd(), "comment.md");

if (process.env.NODE_ENV == "develop") {
  filePath = path.join(process.cwd(), "/dummy-test/prefReportrc.js");
} else {
  const { configFilePath = null } = program.opts();
  if (configFilePath) {
    filePath = configFilePath;
  } else {
    process.stderr.write("Config file path not found");
    process.exit(1);
  }
}

options = getConfig(filePath);

const {
  headfull = options?.option.headless || false,
  medianRun = options?.option.run || 3,
  markdown = options?.option.markdown || false,
  configFilePath = null,
  markdownComment = options?.option.markdownPath || defaultOutMarkdown,
} = program.opts();

if (headfull || medianRun || markdown) {
  Object.assign(options?.option, {
    markdownPath: markdownComment,
    headless: headfull,
    run: medianRun,
    markdown,
  });
}

interface Error {
  name: string;
  message: string;
  stack?: string;
  stdout?: string;
  stderr?: string;
}

console.log(
  chalk.green(
    figlet.textSync("web vitals ci", {
      height: 10,
      whitespaceBreak: false,
    })
  )
);

function getConfig(filePath?: string) {
  if (!filePath) return;
  let config;
  try {
    config = require(filePath);
    return config;
  } catch (error) {
    process.stderr.write(chalk.red("Config file can't be imported"));
    process.exit(1);
  }
}
GatherLighthouseData(options).catch((error: Error) => {
  process.stderr.write(chalk.red("error while running the cli", error));
  if (error.stdout) process.stderr.write("\n" + error.stdout.slice(0, 4000));
  if (error.stderr) process.stderr.write("\n" + error.stderr);
  process.exit(1);
});
