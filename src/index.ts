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

const { configFilePath = null } = program.opts();
const dummyConfigFilePath = path.join(
  process.cwd(),
  "/dummy-test/prefReportrc.js"
);
process.stdout.write(`config file path in cli at ${configFilePath}`);
if (configFilePath) {
  filePath = configFilePath;
} else if (dummyConfigFilePath && !configFilePath) {
  filePath = dummyConfigFilePath;
} else {
  process.stderr.write(chalk.red("No config file path provided"));
  process.exit(1);
}

options = getConfig(filePath);

const {
  headfull = options?.option.headless || false,
  medianRun = options?.option.run || 3,
  markdown = options?.option.markdown || false,
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
  try {
    process.stdout.write(chalk.green("\n file path:" + filePath + "\n"));
    const config = require(filePath);
    return config;
  } catch (error) {
    process.stderr.write(
      chalk.red(`\nConfig file can't be imported at ${filePath}\n`)
    );
    process.stderr.write(error as string);
    process.exit(1);
  }
}
GatherLighthouseData(options).catch((error: Error) => {
  process.stderr.write(chalk.red("error while running the cli", error));

  process.exit(1);
});
